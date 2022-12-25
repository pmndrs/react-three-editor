import { Icon } from "@iconify/react"
import { Command } from "cmdk"
import { FC, useCallback, useEffect, useRef } from "react"
import { useEditor } from "../editable"
import { selectActiveCommands } from "./store"
import { commandBarTunnel } from "./tunnel"
import { CommandType } from "./types"

export const CommandChain: FC = () => {
  const editor = useEditor()
  const activeCommandChain = editor.commands.store(
    ({ activeCommandChain }) => activeCommandChain
  )
  return (
    <div>
      <div cmdk-vercel-badge="">Home</div>
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
  const filter = editor.commands.store((state) => state.filter)
  const onInputValueChange = useCallback(
    (filter: string) => {
      editor.commands.useStore.setState({ filter })
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

export function EditorCommand() {
  const editor = useEditor()
  const commands = editor.commands.store(selectActiveCommands)

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

  const onSelect = useCallback(() => {
    if (Array.isArray(command.subcommands) && command.subcommands.length) {
      editor.commands.openCommandGroup(command.name)
      _onSelect?.(command)
    } else {
      editor.commands.toggleCommandBar(false)
      _onSelect?.(command)
      command.execute?.(editor)
    }
  }, [_onSelect, command, editor])

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
