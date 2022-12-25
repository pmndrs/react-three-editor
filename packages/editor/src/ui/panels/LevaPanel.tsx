import { Leva, LevaPanel as InnerLevalPanel, useControls } from "leva"
import { ComponentProps, useEffect, useState } from "react"
import { useEditor } from "../../editable"

import { useThree } from "@react-three/fiber"
import { StoreType } from "leva/dist/declarations/src/types"
import { In } from "../tunnel"
import { LeftPanel, RightPanel } from "./panel-tunnels"

export function usePanel(defaultName: StoreType | string) {
  const editor = useEditor()
  return editor.getPanel(defaultName)
}

export function FloatingLevaPanel(props: OurPanelProps) {
  const size = useThree((s) => s.size)
  return (
    <In>
      <LevaPanel {...props} size={size} floating />
    </In>
  )
}

export type OurPanelProps = {
  panel: string | ReturnType<typeof usePanel>
  title: string
  width?: number
  collapsed?: boolean
  side: string
  reveal?: boolean
  floating?: boolean
  size?: {
    width: number
  }
} & Omit<ComponentProps<typeof InnerLevalPanel>, "store">

export function LevaPanel({
  panel: id,
  title,
  width = 280,
  collapsed = false,
  side = "left",
  reveal = false,
  floating,
  size = { width: 1000 },
  ...props
}: OurPanelProps) {
  const leftTunnel = LeftPanel.useTunnels()
  const rightTunnel = RightPanel.useTunnels()

  let hasLeft = Object.values(leftTunnel).filter(Boolean).length > 0
  let hasRight = Object.values(rightTunnel).filter(Boolean).length > 0
  const panel = usePanel(id)
  const editor = useEditor()
  const settingsPanel = usePanel(editor.store((s) => s.settingsPanel))
  const mode = editor.useMode()
  useControls(
    editor.settingsPath("panels"),
    {},
    { collapsed: true },
    {
      store: settingsPanel.store
    },
    [mode]
  )

  const [_collapsed, setCollapsed] = useState(reveal ? true : collapsed)
  const [position, setPosition] = useState({
    x:
      side === "left"
        ? -(size.width + (hasRight ? (hasLeft ? 280 : 360) : 0)) + width + 40
        : -(hasRight ? (hasLeft ? 280 : 360) : 0),
    y: 0
  })

  useEffect(() => {
    setCollapsed(collapsed)
  }, [collapsed])

  useEffect(() => {
    if (floating) {
      setPosition({
        x:
          side === "left"
            ? -(size.width + (hasRight ? (hasLeft ? 280 : 360) : 0)) +
              width +
              40
            : -(hasRight ? (hasLeft ? 280 : 360) : 0),
        y: 0
      })
    }
  }, [size, side, width, hasLeft, hasRight])

  return (
    <>
      {panel.store ? (
        <InnerLevalPanel
          store={panel.store}
          {...(floating
            ? {
                titleBar: {
                  title,
                  position,
                  onDragEnd(position) {
                    setPosition(position as { x: number; y: number })
                  }
                }
              }
            : {
                fill: true,
                flat: true,
                titleBar: false
              })}
          theme={{
            space: {
              rowGap: "2px"
            },
            sizes: {
              rootWidth: `${width}px`
            }
          }}
          collapsed={{ collapsed: _collapsed, onChange: setCollapsed }}
          {...props}
        />
      ) : (
        <Leva
          {...(floating
            ? {
                titleBar: {
                  title,
                  position,
                  onDragEnd(position) {
                    setPosition(position as { x: number; y: number })
                  }
                }
              }
            : {
                fill: true,
                flat: true,
                titleBar: false
              })}
          theme={{
            space: {
              rowGap: "2px"
            },
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
