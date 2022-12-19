import { Command } from "cmdk"
import { Fragment, useEffect, useRef, useState } from "react"
import { ThreeEditor } from "../../ThreeEditor"
import { commandStore } from "./store"
import { commandBarTunnel } from "./tunnel"
import { Item } from "./CommandbarItem"

export function EditorCommand({ editor }: { editor: ThreeEditor }) {
  const theme = "dark"
  const [value, setValue] = useState("linear")
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef(null)

  useEffect(() => {
    inputRef?.current?.focus()
  }, [])

  const commands = commandStore((state) => state.commands)

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
      </Command.List>
    </commandBarTunnel.In>
  )
}
