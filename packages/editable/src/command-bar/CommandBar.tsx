import { Command } from "cmdk"
import { KeyboardEvent, useCallback } from "react"
import { useEditor } from "../useEditor"
import { EditorCommandBar } from "./EditorCommand"
import { commandBarTunnel } from "./tunnel"

export type CommandBarProps = {}
export const CommandBar = {
  In: EditorCommandBar,
  Out: () => {
    const editor = useEditor()
    const open = editor.commandBar.useStore((state) => state.open)

    editor.useKeyboardShortcut("command-bar", "meta+k", () =>
      editor.commandBar.toggle()
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
          onOpenChange={() => editor.commandBar.toggle()}
          className="commandbar dark vercel"
          tabIndex={-1}
          onKeyDown={onKeydown}
        >
          <commandBarTunnel.Outs />
        </Command.Dialog>
      </>
    )
  }
}
