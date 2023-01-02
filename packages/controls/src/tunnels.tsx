import { PropsWithChildren, ReactNode, useId, useLayoutEffect } from "react"
import tunnel from "tunnel-rat"
import create, { UseBoundStore as Store } from "zustand"

export type TunnelsStateType = Record<
  string,
  {
    In: (props: any) => null
    Out: () => JSX.Element
  }
>

export type MultiTunnel = {
  In: (props: PropsWithChildren<{ id?: string }>) => JSX.Element
  Out: (props: { fallback?: ReactNode }) => JSX.Element
  useTunnels: Store<TunnelsStateType>
}

export function createMultiTunnel(): MultiTunnel {
  const useTunnels = create<TunnelsStateType>(() => ({}))

  function In({ children, id }: PropsWithChildren<{ id?: string }>) {
    let tunnelId = id || useId()
    let OldTunnel = useTunnels((state) => state[tunnelId])
    if (!OldTunnel) {
      OldTunnel = tunnel()
    }

    useLayoutEffect(() => {
      useTunnels.setState({
        [tunnelId]: OldTunnel
      })
      return () => {
        useTunnels.setState((state) => {
          let newState = { ...state }
          delete newState[tunnelId]
          return newState
        }, true)
      }
    }, [tunnelId, OldTunnel])

    return <OldTunnel.In>{children}</OldTunnel.In>
  }

  function Out({ fallback }: { fallback?: ReactNode }) {
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
    Out,
    useTunnels
  }
}
