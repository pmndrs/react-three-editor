import { PropsWithChildren, ReactNode, useEffect, useId } from "react"
import tunnel from "tunnel-rat"
import create from "zustand"

export type TunnelsStateType = Record<
  string,
  | {
      In: ({ children }: any) => null
      Out: () => JSX.Element
    }
  | undefined
>

export function createMultiTunnel() {
  const useTunnels = create<TunnelsStateType>(() => ({}))

  function In({ children }: PropsWithChildren<{}>) {
    const id = useId()
    let OldTunnel = useTunnels((state) => state[id])
    if (!OldTunnel) {
      OldTunnel = tunnel()
      useTunnels.setState({
        [id]: OldTunnel
      })
    }

    useEffect(() => {
      return () => {
        useTunnels.setState({
          [id]: undefined
        })
      }
    }, [OldTunnel])

    return <OldTunnel.In>{children}</OldTunnel.In>
  }

  function Outs({ fallback }: { fallback?: ReactNode }) {
    const tunnels = useTunnels()
    let activeTunnels = Object.entries(tunnels).filter(([k, v]) => v)

    if (activeTunnels.length === 0 && fallback) return <>{fallback}</>

    return (
      <>
        {activeTunnels.map(([key, { Out }]) => (
          <Out key={key} />
        ))}
      </>
    )
  }

  return {
    In,
    Outs,
    useTunnels
  }
}
