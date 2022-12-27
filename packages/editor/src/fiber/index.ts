export {
  addTail,
  advance,
  applyProps,
  createEvents,
  createPortal,
  createRoot,
  extend,
  useLoader,
  useThree
} from "@react-three/fiber"
export { button, buttonGroup, folder, levaStore as defaultPanel } from "leva"
export { default as createTunnel } from "tunnel-rat"
export { default as createStore } from "zustand"
export {
  editable,
  Editable,
  EditorContext,
  setEditable,
  useEditor
} from "../editable"
export { useControls } from "../ui/leva/useControls"
export { createMultiTunnel } from "../ui/tunnels"
export { Canvas, Editor, EditorRoot } from "./Canvas"
export { CameraGizmos } from "./controls/CameraGizmos"
export { PerformanceControls } from "./controls/PerformanceControls"
export { SceneControls } from "./controls/SceneControls"
export { SelectedElementControls } from "./controls/SelectedElementControls"
export { editor } from "./editor"
export {
  Stages,
  useEditorFrame,
  useEditorUpdate,
  useFrame,
  useUpdate
} from "./useFrame"
export {
  Screenshot,
  ScreenshotCanvas,
  useScreenshotStore
} from "./useScreenshotStore"

export function extendControls(t: any, controls: Record<string, {}>) {
  t.controls = controls
}
