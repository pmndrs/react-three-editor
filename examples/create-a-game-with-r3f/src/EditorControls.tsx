import {
  CameraGizmos,
  Editor,
  Panel,
  PerformanceControls,
  SceneControls,
  SelectedElementControls
} from "@react-three/editor"

export function EditorControls() {
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
