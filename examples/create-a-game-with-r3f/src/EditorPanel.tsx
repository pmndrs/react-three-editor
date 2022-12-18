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
      <SceneControls store="scene" />
      <SelectedElementControls store="default" />
      <PerformanceControls store="scene" />
      <CameraGizmos />
    </Editor>
  )
}
