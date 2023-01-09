import { CommandBar, KeyboardCommands } from "@editable-jsx/commander"
import {
  SceneControls,
  SelectedElementControls,
  useEditor
} from "@editable-jsx/editable"
import { EditorCamera } from "./EditorCamera"
import { FiberControls } from "./FiberControls"

export function EditorControls() {
  const { grid, axes } = useEditor().useSettings("helpers", {
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
      {grid && <gridHelper />}
      {axes && <axesHelper />}
    </>
  )
}
