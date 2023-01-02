import { Icon } from "@iconify/react"
import { Command } from "cmdk"
import { FC, useCallback } from "react"
import { CommandBarState } from "../commands/CommandBar"
import { Editor } from "../Editor"
import { useEditor } from "../useEditor"
import { commandBarTunnel } from "./tunnel"
import { CommandType } from "./types"
import { useCommandBar } from "./useCommandBar"

export const CommandChain: FC = () => {
  const editor = useEditor()
  const activeCommandChain = editor.commandBar.useStore(
    ({ activeCommandChain }) => activeCommandChain
  )
  return (
    <div
      style={{
        marginLeft: 8
      }}
    >
      {activeCommandChain.map((n) => {
        return (
          <div key={n} cmdk-vercel-badge="">
            {n}
          </div>
        )
      })}
    </div>
  )
}

export const CommandInput: FC = () => {
  const editor = useEditor()
  const filter = editor.commandBar.useStore((state) => state.filter)
  const onInputValueChange = useCallback(
    (filter: string) => {
      editor.commandBar.filter = filter
    },
    [editor.commands.useStore]
  )
  return (
    <Command.Input
      autoFocus
      placeholder="Search for apps and commands..."
      value={filter}
      onValueChange={onInputValueChange}
    />
  )
}

const selectActiveCommands = (
  editor: Editor,
  state: CommandBarState
): CommandType[] => {
  const folderChain = state.activeCommandChain
  if (folderChain.length) {
    return Object.values(editor.commands.store.getState().commands).filter(
      (c) => c.parentId === folderChain[folderChain.length - 1]
    )
  } else {
    return Object.values(editor.commands.store.getState().commands).filter(
      (c) => typeof c.parentId === "undefined" || c.parentId === null
    )
  }
}

export function EditorCommandBar() {
  const editor = useEditor()
  const commands = editor.commandBar.useStore((state) =>
    selectActiveCommands(editor, state)
  )

  return (
    <commandBarTunnel.In>
      <div cmdk-raycast-top-shine="" />
      <CommandChain />
      <CommandInput />
      <hr cmdk-raycast-loader="" />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        {(commands ?? []).map((command) => {
          if (command.render && !command.render(editor)) return null
          return <CommandItem key={command.name} command={command} />
        })}
      </Command.List>
    </commandBarTunnel.In>
  )
}

export type CommandProps = {
  command: CommandType
  onSelect?(command: CommandType): void
}
export const CommandItem: FC<CommandProps> = ({
  command,
  onSelect: _onSelect
}) => {
  const { icon, description, render, shortcut } = command
  const editor = useEditor()
  const commandBar = useCommandBar()

  const onSelect = useCallback(() => {
    if (Array.isArray(command.subcommands) && command.subcommands.length) {
      commandBar.openCommandGroup(command.name)
      _onSelect?.(command)
    } else {
      commandBar.toggle(false)
      _onSelect?.(command)
      command.execute?.(editor)
    }
  }, [_onSelect, command, editor, commandBar])

  if (render && !render(editor)) return null

  return (
    <Command.Item value={command.name} onSelect={onSelect}>
      {typeof icon === "function" ? (
        icon(editor)
      ) : typeof icon == "string" ? (
        <Icon icon={icon} />
      ) : null}
      {typeof description === "function"
        ? description(editor)
        : description || command.name}
      <div cmdk-raycast-meta="" cmdk-raycast-submenu-shortcuts="">
        {shortcut?.map((key, i) => (
          <kbd key={`${i}`}>
            {key === "meta" ? "⌘" : key === "shift" ? "⇧" : key.toUpperCase()}
          </kbd>
        ))}
      </div>
    </Command.Item>
  )
}
