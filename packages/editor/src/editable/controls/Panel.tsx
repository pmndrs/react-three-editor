import { useThree } from "@react-three/fiber"
import { Leva, LevaPanel, useControls } from "leva"
import { ComponentProps, useEffect, useState } from "react"
import { useEditor } from "../useEditor"
import { In } from "./Outs"

import { StoreType } from "leva/dist/declarations/src/types"

export function usePanel(defaultName: StoreType | string) {
  const editor = useEditor()
  return editor.getPanel(defaultName)
}

export function Panel({
  id,
  title,
  width = 280,
  collapsed = false,
  pos = "left",
  ...props
}: {
  id: string
  title: string
  width: number
  collapsed?: boolean
  pos: "left" | "right"
} & Omit<ComponentProps<typeof LevaPanel>, "store">) {
  const panel = usePanel(id)
  const editor = useEditor()
  const settingsPanel = usePanel(editor.store((s) => s.settingsPanel))
  const mode = editor.useMode("editor")
  useControls(
    `world.` + `${mode ? "editor" : "play"} settings.panels`,
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
  const [_collapsed, setCollapsed] = useState(true)
  const [position, setPosition] = useState({
    x: pos === "left" ? -size.width + width + 20 : 0,
    y: 0
  })

  const hidden = useEffect(() => {
    setCollapsed(collapsed)
  }, [collapsed])

  useEffect(() => {
    setPosition({ x: pos === "left" ? -size.width + width + 20 : 0, y: 0 })
  }, [size, pos])

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
