import { Leva as DefaultControls, LevaPanel as Controls } from "leva"
import { useEffect, useState } from "react"
import { usePanel } from "../usePanel"
import { PanelProps } from "./types"

export function ControlsPanel({
  panel: id,
  title,
  width = 280,
  collapsed = false,
  side = "left",
  reveal = false,
  size = { width: 1000 },
  ...props
}: PanelProps) {
  const panel = usePanel(id)

  const [_collapsed, setCollapsed] = useState(reveal ? true : collapsed)

  useEffect(() => {
    setCollapsed(collapsed)
  }, [collapsed])

  return (
    <>
      {panel.store ? (
        <Controls
          store={panel.store}
          fill={true}
          flat={true}
          titleBar={false}
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
        <DefaultControls
          isRoot
          fill={true}
          flat={true}
          titleBar={false}
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
