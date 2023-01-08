import { CommandBar, KeyboardCommands } from "@editable-jsx/commander"
import { SceneControls } from "./SceneControls"
import { SelectedElementControls } from "./SelectedElementControls"

export function BaseEditorControls() {
  return (
    <>
      <SelectedElementControls panel="properties" />
      <SceneControls panel="scene" />
      <CommandBar.In />
      <KeyboardCommands />
    </>
  )
}
