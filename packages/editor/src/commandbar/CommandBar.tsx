import { Command } from "cmdk"
import { FC, KeyboardEvent, useCallback } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { useEditor } from "../editable"
import { EditorCommand } from "./EditorCommand"
import { KeyboardCommands } from "./KeyboardCommand"
import { commandBarTunnel } from "./tunnel"

export type CommandBarProps = {}
export const CommandBar: FC<CommandBarProps> = () => {
  const editor = useEditor()
  const open = editor.commandStore((state) => state.open)

  useHotkeys("meta+space", () => editor.toggleCommandBar(), {
    preventDefault: true
  })

  const onKeydown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Backspace") {
        editor.closeCommandGroup()
      }
    },
    [editor]
  )

  return (
    <>
      <Command.Dialog
        open={open}
        onOpenChange={() => editor.toggleCommandBar()}
        className="commandbar dark vercel"
        tabIndex={-1}
        onKeyDown={onKeydown}
      >
        <commandBarTunnel.Outs />
      </Command.Dialog>
    </>
  )
}

export function CommandBarControls() {
  const editor = useEditor()
  const open = editor.commandStore((state) => state.open)

  return (
    <>
      <EditorCommand key={open ? 0 : 1} />
      <KeyboardCommands />
    </>
  )
}
