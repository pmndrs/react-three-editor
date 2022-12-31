export {
  editable,
  Editable,
  EditorContext,
  setEditable,
  useEditor
} from "@editable-jsx/core"
export {
  applyProps,
  createPortal,
  extend,
  useLoader,
  useThree
} from "@react-three/fiber"
export { button, buttonGroup, folder, levaStore as defaultPanel } from "leva"
export { useControls } from "../ui/leva/useControls"
export { Canvas, Editor } from "./Canvas"
export { CameraGizmos } from "./controls/CameraGizmos"
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
