export { createPortal, extend, useLoader, useThree } from "@react-three/fiber"
export { useControls } from "../editable/controls/useControls"
export { editable, Editable, setEditable } from "../editable/editable"
export { EditorContext, useEditor } from "../editable/Editor"
export { Canvas, Editor } from "./EditableCanvas"
export { CameraGizmos } from "./EditorGizmos"
export { PerformanceControls } from "./PerfControls"
export { SceneControls, ScenePanel } from "./SceneTree"
export { SelectedElementControls } from "./SelectedElement"
export { useEditorFrame, useFrame } from "./useFrame"

export function extendControls(t: any, controls: Record<string, {}>) {
  t.controls = controls
}
