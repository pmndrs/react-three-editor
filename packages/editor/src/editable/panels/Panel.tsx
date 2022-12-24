import { useThree } from "@react-three/fiber"
import { Leva, LevaPanel, useControls } from "leva"
import { ComponentProps, useEffect, useState } from "react"
import { In } from "../tunnel"
import { useEditor } from "../useEditor"

import { StoreType } from "leva/dist/declarations/src/types"

export function usePanel(defaultName: StoreType | string) {
  const editor = useEditor()
  return editor.getPanel(defaultName)
}

export function Panel({
  panel: id,
  title,
  width = 280,
  collapsed = false,
  pos = "left",
  reveal = false,
  ...props
}: {
  panel: string | ReturnType<typeof usePanel>
  title: string
  width: number
  collapsed?: boolean
  pos: "left" | "right"
  reveal?: boolean
} & Omit<ComponentProps<typeof LevaPanel>, "store">) {
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
  const [{ hidden: different }] = editor.useSettings("panels." + id, {
    hidden: {
      value: false
    }
  })

  const size = useThree((s) => s.size)
  const [_collapsed, setCollapsed] = useState(reveal ? true : collapsed)
  const [position, setPosition] = useState({
    x: pos === "left" ? -size.width + width + 20 : 0,
    y: 0
  })

  const hidden = useEffect(() => {
    setCollapsed(collapsed)
  }, [collapsed])

  useEffect(() => {
    setPosition({ x: pos === "left" ? -size.width + width + 20 : 0, y: 0 })
  }, [size, pos, width])

  return (
    <In>
      {panel.store ? (
        <LevaPanel
          store={panel.store}
          titleBar={{
            position,
            onDragEnd(position) {
              setPosition(position as { x: number; y: number })
            },
            title: title
          }}
          hidden={Boolean(different)}
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
          titleBar={{
            position,
            onDragEnd(position) {
              setPosition(position as { x: number; y: number })
            },
            title: title
          }}
          hidden={Boolean(different)}
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
    </In>
  )
}
