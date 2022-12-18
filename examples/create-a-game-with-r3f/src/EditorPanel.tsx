import {
  CameraGizmos,
  Editor,
  Panel,
  PerformanceControls,
  SceneControls,
  SelectedElementControls
} from "@react-three/editor"
import { useState } from "react"

export function EditorPanel() {
  const [state, setState] = useState("scene")

  return (
    <Editor>
      <Panel title="scene" />
      <Panel title="properties" pos="right" />
      <SceneControls store={state} />
      <SelectedElementControls store="default" />
      <PerformanceControls store="scene" />
      <CameraGizmos />
    </Editor>
  )
}
