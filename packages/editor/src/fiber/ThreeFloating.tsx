import { Floating, FloatingContext } from "@editable-jsx/controls"
import { useThree } from "@react-three/fiber"
import { PropsWithChildren } from "react"
import { ThreeCanvas } from "./ThreeCanvas"

export function ThreeFloating({
  children
}: {
  children: (size: { width: number; height: number }) => JSX.Element
}) {
  return (
    <ThreeCanvas.In>
      <ThreeCanvasFloating>{children}</ThreeCanvasFloating>
    </ThreeCanvas.In>
  )
}

export function ThreeFloatingProvider({ children }: PropsWithChildren<{}>) {
  return (
    <FloatingContext.Provider value={ThreeFloating}>
      {children}
    </FloatingContext.Provider>
  )
}
function ThreeCanvasFloating({
  children
}: {
  children: (size: { width: number; height: number }) => JSX.Element
}) {
  const size = useThree((s) => s.size)
  return <Floating.In>{children(size)}</Floating.In>
}
