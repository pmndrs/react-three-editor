import { PropsWithChildren, useId } from "react"
import tunnel from "tunnel-rat"
import create from "zustand"

export type TunnelsStateType = Record<
  string,
  {
    In: ({ children }: any) => null
    Out: () => JSX.Element
  }
>

export const useTunnels = create<TunnelsStateType>(() => ({}))

export function In({ children }: PropsWithChildren<{}>) {
  const id = useId()
  let OldTunnel = useTunnels((state) => state[id])
  if (!OldTunnel) {
    OldTunnel = tunnel()
    useTunnels.setState({
      [id]: OldTunnel
    })
  }

  return <OldTunnel.In>{children}</OldTunnel.In>
}

export function Outs() {
  const tunnels = useTunnels()
  return (
    <>
      {Object.entries(tunnels).map(([key, { Out }]) => (
        <Out key={key} />
      ))}
    </>
  )
}
