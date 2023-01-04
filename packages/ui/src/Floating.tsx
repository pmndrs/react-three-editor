import { createContext, FC, useContext } from "react"
import { createMultiTunnel } from "./tunnels"

const FloatingTunnel = createMultiTunnel()

export const FloatingContext = createContext<FC<any>>(() => (<></>) as any)

export function Floating({
  children
}: {
  children: (size: { width: number; height: number }) => JSX.Element
}) {
  const FloatingProvider = useContext(FloatingContext)
  return <FloatingProvider>{children}</FloatingProvider>
}

Floating.In = FloatingTunnel.In
Floating.Out = FloatingTunnel.Out
