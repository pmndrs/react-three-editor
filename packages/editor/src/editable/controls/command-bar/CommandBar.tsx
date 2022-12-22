import { Command } from "cmdk"
import { useHotkeys } from "react-hotkeys-hook"
import { useEditor } from "../../useEditor"
import { EditorCommand } from "./EditorCommand"
import { KeyboardCommands } from "./KeyboardCommand"
import { useCommandStore } from "./store"
import { commandBarTunnel } from "./tunnel"

export const CommandBar = () => {
  const toggleOpen = useCommandStore(({ toggleOpen }) => toggleOpen)
  const open = useCommandStore((state) => state.open)

  // Toggle the menu when ⌘K is pressed
  useHotkeys("meta+k", () => toggleOpen())

  return (
    <>
      <Command.Dialog
        open={open}
        onOpenChange={toggleOpen}
        className="commandbar dark vercel"
        tabIndex={-1}
      >
        <commandBarTunnel.Outs />
      </Command.Dialog>
    </>
  )
}

export function CommandBarControls() {
  const open = useCommandStore((state) => state.open)
  const editor = useEditor()

  return (
    <>
      <EditorCommand editor={editor} key={open ? 0 : 1} />
      <KeyboardCommands />
    </>
  )
}
