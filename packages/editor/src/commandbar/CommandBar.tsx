import { Command } from "cmdk"
import { FC, KeyboardEvent, useCallback } from "react"
import { useEditor } from "../editable"
import { EditorCommand } from "./EditorCommand"
import { KeyboardCommands } from "./KeyboardCommand"
import { commandBarTunnel } from "./tunnel"

export type CommandBarProps = {}
export const CommandBar: FC<CommandBarProps> = () => {
  const editor = useEditor()
  const open = editor.commands.store((state) => state.open)

  editor.useKeyboardShortcut("command-bar", "meta-k", () =>
    editor.commands.toggleCommandBar()
  )

  const onKeydown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (
        event.key === "Backspace" &&
        editor.commands.store.getState().filter.length === 0
      ) {
        editor.commands.closeCommandGroup()
      }
    },
    [editor]
  )

  return (
    <>
      <Command.Dialog
        open={open}
        onOpenChange={() => editor.commands.toggleCommandBar()}
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
  const open = editor.commands.store((state) => state.open)

  return (
    <>
      <EditorCommand key={open ? 0 : 1} />
      <KeyboardCommands />
    </>
  )
}
