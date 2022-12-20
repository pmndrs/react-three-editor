export {
  applyProps,
  createPortal,
  extend,
  useLoader,
  useThree
} from "@react-three/fiber"
export { button, buttonGroup, folder, levaStore as defaultPanel } from "leva"
export { useControls } from "../editable/controls/useControls"
export { editable, Editable, setEditable } from "../editable/editable"
export { EditorContext, useEditor } from "../editable/Editor"
export { Canvas, Editor } from "./Canvas"
export { CameraGizmos } from "./controls/CameraGizmos"
export { Panel, usePanel } from "./controls/Panel"
export { PerformanceControls } from "./controls/PerformanceControls"
export { SceneControls } from "./controls/SceneControls"
export { SelectedElementControls } from "./controls/SelectedElementControls"
export {
  Stages,
  useEditorFrame,
  useEditorUpdate,
  useFrame,
  useUpdate
} from "./useFrame"

export function extendControls(t: any, controls: Record<string, {}>) {
  t.controls = controls
}
