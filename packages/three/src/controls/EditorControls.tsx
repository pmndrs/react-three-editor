import { CommandBar, KeyboardCommands } from "@editable-jsx/commander"
import { useEditor } from "@editable-jsx/editable"
import { EditorCamera } from "./EditorCamera"
import { PerformanceControls } from "./PerformanceControls"
import { SceneControls } from "./SceneControls"
import { SelectedElementControls } from "./SelectedElementControls"

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
      <PerformanceControls panel="settings" order={1} />
      {grid && <gridHelper />}
      {axes && <axesHelper />}
    </>
  )
}
