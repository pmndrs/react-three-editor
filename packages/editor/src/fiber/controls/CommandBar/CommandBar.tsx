import { Command } from "cmdk"
import { useHotkeys } from "react-hotkeys-hook"
import { useEditor } from "../../../editable/Editor"
import { EditorCommand } from "./EditorCommand"
import { KeyboardCommands } from "./KeyboardCommand"
import { commandStore } from "./store"
import { commandBarTunnel } from "./tunnel"

export const CommandBar = () => {
  function toggleOpen() {
    commandStore.setState({ open: !commandStore.getState().open })
  }
  const open = commandStore((state) => state.open)

  // Toggle the menu when ⌘K is pressed
  useHotkeys("meta+k", () => toggleOpen(), { preventDefault: true })

  return (
    <>
      <Command.Dialog
        open={open}
        onOpenChange={toggleOpen}
        className="commandbar dark"
        tabIndex={-1}
      >
        <commandBarTunnel.Outs />
      </Command.Dialog>
    </>
  )
}

export function CommandBarControls() {
  const open = commandStore((state) => state.open)
  const editor = useEditor()

  return (
    <>
      <EditorCommand editor={editor} key={open ? 0 : 1} />
      <KeyboardCommands />
    </>
  )
}
