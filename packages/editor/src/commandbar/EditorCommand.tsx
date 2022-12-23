import { Icon } from "@iconify/react"
import { Command } from "cmdk"
import { FC, useCallback, useEffect, useRef } from "react"
import { Editor, useEditor } from "../editable"
import { selectActiveCommands } from "./store"
import { commandBarTunnel } from "./tunnel"
import { CommandGroup, ExecutableCommand } from "./types"

export function EditorCommand() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef(null)
  const editor = useEditor()

  useEffect(() => {
    inputRef?.current?.focus()
  }, [])

  const activeCommandChain = editor.commandStore(
    ({ activeCommandChain }) => activeCommandChain
  )
  const commands = editor.commandStore(selectActiveCommands)
  const filter = editor.commandStore((state) => state.filter)
  const onInputValueChange = useCallback(
    (filter: string) => {
      editor.commandStore.setState({ filter })
    },
    [editor.commandStore]
  )

  return (
    <commandBarTunnel.In>
      <div cmdk-raycast-top-shine="" />
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
      <Command.Input
        ref={inputRef}
        autoFocus
        placeholder="Search for apps and commands..."
        value={filter}
        onValueChange={onInputValueChange}
      />
      <hr cmdk-raycast-loader="" />
      <Command.List ref={listRef}>
        <Command.Empty>No results found.</Command.Empty>
        {(commands ?? []).map((command) => {
          if (command.render && !command.render(editor)) return null
          if (Array.isArray((command as CommandGroup).children)) {
            return (
              <CommandGroupItem
                key={command.name}
                command={command as CommandGroup}
              />
            )
          } else {
            return (
              <CommandItem
                key={command.name}
                command={command as ExecutableCommand}
              />
            )
          }
        })}
      </Command.List>
    </commandBarTunnel.In>
  )
}

export type CommandGroupItemProps = {
  command: CommandGroup
  onSelect?(command: CommandGroup): void
}
export const CommandGroupItem: FC<CommandGroupItemProps> = ({
  command,
  onSelect: _onSelect
}) => {
  const editor = useEditor()
  const { icon, description, render } = command
  const _editor = useEditor()

  const onSelect = useCallback(() => {
    editor.openCommandGroup(command.name)
    _onSelect?.(command)
  }, [_onSelect, command, editor])

  if (render && !render(_editor)) return null

  return (
    <Command.Item value={command.name} onSelect={onSelect}>
      {typeof icon === "function" ? (
        icon(_editor)
      ) : typeof icon == "string" ? (
        <Icon icon={icon} />
      ) : null}
      {typeof description === "function"
        ? description(_editor)
        : description || command.name}
    </Command.Item>
  )
}

export type CommandProps = {
  command: ExecutableCommand
  onSelect?(command: ExecutableCommand): void
}
export const CommandItem: FC<CommandProps> = ({
  command,
  onSelect: _onSelect
}) => {
  const { icon, description, render, shortcut } = command
  const editor = useEditor()

  const onSelect = useCallback(() => {
    editor.toggleCommandBar(false)
    _onSelect?.(command)
    ;(command as ExecutableCommand).execute?.(editor)
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
