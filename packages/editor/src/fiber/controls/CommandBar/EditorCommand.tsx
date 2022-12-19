import { Icon } from "@iconify/react"
import { Command } from "cmdk"
import { FC, useCallback, useEffect, useRef } from "react"
import { useEditor } from "../../../editable/Editor"
import { ThreeEditor } from "../../ThreeEditor"
import { useCommandStore } from "./store"
import { commandBarTunnel } from "./tunnel"
import { CommandGroup, ExecutableCommand } from "./types"

export function EditorCommand({ editor }: { editor: ThreeEditor }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef(null)

  useEffect(() => {
    inputRef?.current?.focus()
  }, [])

  const commands = useCommandStore((state) => state.commands)

  return (
    <commandBarTunnel.In>
      <div cmdk-raycast-top-shine="" />
      <Command.Input
        ref={inputRef}
        autoFocus
        placeholder="Search for apps and commands..."
      />
      <hr cmdk-raycast-loader="" />
      <Command.List ref={listRef}>
        <Command.Empty>No results found.</Command.Empty>
        {commands.map((command) => {
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
}
export const CommandGroupItem: FC<CommandGroupItemProps> = ({ command }) => {
  const { icon, description, render } = command
  const _editor = useEditor()
  const toggleOpen = useCommandStore(({ toggleOpen }) => toggleOpen)

  const onSelect = useCallback(() => {
    toggleOpen(false)
  }, [])

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
}
export const CommandItem: FC<CommandProps> = ({ command }) => {
  const { icon, description, render, shortcut } = command
  const _editor = useEditor()
  const toggleOpen = useCommandStore(({ toggleOpen }) => toggleOpen)

  const onSelect = useCallback(() => {
    toggleOpen(false)
    ;(command as ExecutableCommand).execute(_editor)
  }, [])

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

/*
<Command.Group heading="Commands">
          {commands.map((command) => (
            <Fragment key={command.name}>
              {command.render(editor) ? (
                <Item
                  shortcut={command.shortcut}
                  value={command.name}
                  onSelect={() => command.execute(editor)}
                >
                  {command.icon(editor)}
                  {command.description(editor)}
                </Item>
              ) : null}
            </Fragment>
          ))}
        </Command.Group>
*/
