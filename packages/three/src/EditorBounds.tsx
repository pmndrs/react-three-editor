import { useEditor } from "@editable-jsx/editable"
import { Bounds, useBounds } from "@react-three/drei"
import { useStore, useThree } from "@react-three/fiber"
import { ReactNode } from "react"
import { ThreeEditor } from "./ThreeEditor"

export function EditorBounds({ children }: { children: ReactNode }) {
  return (
    <Bounds margin={2}>
      <AssignBounds />
      {children}
    </Bounds>
  )
}
function AssignBounds() {
  const editor = useEditor<ThreeEditor>()
  const threeStore = useStore()
  const size = useThree((s) => s.size)
  const raycaster = useThree((s) => s.raycaster)
  const scene = useThree((s) => s.scene)
  const bounds = useBounds()
  editor.canvasSize = size
  editor.raycaster = raycaster
  editor.bounds = bounds
  editor.scene = scene
  editor.threeStore = threeStore

  return null
}
