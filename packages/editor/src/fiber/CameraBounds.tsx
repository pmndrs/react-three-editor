import { Bounds, useBounds } from "@react-three/drei"
import { ReactNode } from "react"
import { useEditor } from "../editable"
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
  const bounds = useBounds()

  editor.bounds = bounds

  return null
}
