import { ControlledStore, defaultStore } from "@editable-jsx/state"
import { Leva as DefaultControls, LevaPanel as Controls } from "leva"
import { StoreType } from "leva/dist/declarations/src/types"
import { useEffect, useState } from "react"

import { ComponentProps } from "react"

export type PanelProps = {
  store: ControlledStore
  title?: string
  width?: number
  collapsed?: boolean
  side?: string
  lazy?: boolean | number
  order?: number
  floating?: boolean
  size?: {
    width: number
  }
} & Omit<ComponentProps<typeof Controls>, "store">

export function ControlsPanel({
  store,
  title,
  width = 280,
  collapsed = false,
  side = "left",
  lazy = false,
  size = { width: 1000 },
  ...props
}: PanelProps) {
  const [_collapsed, setCollapsed] = useState(lazy ? true : collapsed)

  useEffect(() => {
    if (typeof lazy === "number") {
      let timeout = setTimeout(() => {
        setCollapsed(collapsed)
      }, lazy)
      return () => {
        clearTimeout(timeout)
      }
    } else {
      setCollapsed(collapsed)
    }
  }, [collapsed])

  return (
    <>
      {store && store !== defaultStore ? (
        <Controls
          store={store as StoreType}
          fill={true}
          flat={true}
          titleBar={false}
          theme={{
            // space: {
            //   rowGap: "2px"
            // },
            colors: {
              highlight1: "#CBD5E1"
            },
            sizes: {
              rootWidth: `${width}px`
            }
          }}
          collapsed={{ collapsed: _collapsed, onChange: setCollapsed }}
          {...props}
        />
      ) : (
        <DefaultControls
          isRoot
          fill={true}
          flat={true}
          titleBar={false}
          theme={{
            colors: {
              highlight1: "#CBD5E1"
            },
            // space: {
            //   rowGap: "2px"
            // },
            sizes: {
              rootWidth: `${width}px`
            }
          }}
          collapsed={{ collapsed: _collapsed, onChange: setCollapsed }}
        />
      )}
    </>
  )
}
