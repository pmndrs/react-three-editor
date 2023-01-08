import { CommandBar, KeyboardCommands } from "@editable-jsx/commander"
import { useEditor } from "@editable-jsx/editable"
import { ThreeEditor } from "../ThreeEditor"
import { EditorCamera } from "./EditorCamera"
import { FiberControls } from "./FiberControls"
import { PerformanceControls } from "./PerformanceControls"
import { SceneControls } from "./SceneControls"
import { SelectedElementControls } from "./SelectedElementControls"

export function EditorControls() {
  const editor = useEditor<ThreeEditor>()
  const { grid, axes } = editor.useSettings("helpers", {
    grid: true,
    axes: true
  })

  return (
    <>
      <EditorCamera />
      <SelectedElementControls panel="properties" />
      <SceneControls panel="scene" />
      <CommandBar.In />
      <KeyboardCommands />
      {/* <PerformanceControls panel="settings" order={1} /> */}
      <FiberControls panel="settings" order={1} />
      {grid && <gridHelper layers={editor.gizmoLayer} />}
      {axes && <axesHelper layers={editor.gizmoLayer} />}
    </>
  )
}
