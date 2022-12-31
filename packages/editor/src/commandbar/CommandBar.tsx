import { useEditor } from "@editable-jsx/core"
import { Command } from "cmdk"
import { FC, KeyboardEvent, useCallback } from "react"
import { EditorCommand } from "./EditorCommand"
import { KeyboardCommands } from "./KeyboardCommands"
import { commandBarTunnel } from "./tunnel"

export type CommandBarProps = {}
export const CommandBar: FC<CommandBarProps> = () => {
  const editor = useEditor()
  const open = editor.commandBar.useStore((state) => state.open)

  editor.useKeyboardShortcut("command-bar", "meta+k", () =>
    editor.commandBar.toggleCommandBar()
  )

  const onKeydown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (
        event.key === "Backspace" &&
        editor.commandBar.filter.length === 0
      ) {
        editor.commandBar.closeCommandGroup()
      }
    },
    [editor]
  )

  return (
    <>
      <Command.Dialog
        open={open}
        onOpenChange={() => editor.commandBar.toggleCommandBar()}
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
  const open = editor.commandBar.useStore((state) => state.open)

  return (
    <>
      <EditorCommand key={open ? 0 : 1} />
      <KeyboardCommands />
    </>
  )
}
