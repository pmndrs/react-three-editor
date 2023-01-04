import { useThree } from "@react-three/fiber"
import { PropsWithChildren } from "react"
import {
  Floating,
  FloatingContext
} from "../../../ui-utils/dist/editable-jsx-ui.cjs"
import { ThreeTunnel } from "./ThreeTunnel"

function ThreeFloating({
  children
}: {
  children: (size: { width: number; height: number }) => JSX.Element
}) {
  return (
    <ThreeTunnel.In>
      <ThreeFloatingIn>{children}</ThreeFloatingIn>
    </ThreeTunnel.In>
  )
}

function ThreeFloatingIn({
  children
}: {
  children: (size: { width: number; height: number }) => JSX.Element
}) {
  const size = useThree((s) => s.size)
  return <Floating.In>{children(size)}</Floating.In>
}

export function ThreeFloatingProvider({ children }: PropsWithChildren<{}>) {
  return (
    <FloatingContext.Provider value={ThreeFloating}>
      {children}
    </FloatingContext.Provider>
  )
}
