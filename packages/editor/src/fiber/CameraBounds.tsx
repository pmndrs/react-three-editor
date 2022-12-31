import { useEditor } from "@editable-jsx/core"
import { Bounds, useBounds } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { ReactNode } from "react"
import { ThreeEditor } from "./ThreeEditor"

export function CameraBounds({ children }: { children: ReactNode }) {
  return (
    <Bounds margin={2}>
      <AssignBounds />
      {children}
    </Bounds>
  )
}
function AssignBounds() {
  const editor = useEditor<ThreeEditor>()
  const size = useThree((s) => s.size)
  const bounds = useBounds()
  editor.canvasSize = size

  editor.bounds = bounds

  return null
}
