import { useThree } from "@react-three/fiber"
import { Leva, LevaPanel } from "leva"
import { useEffect, useState } from "react"
import { useEditor } from "../../editable/Editor"
import { In } from "../Canvas"

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
}) {
  const panel = usePanel(id)
  console.log(panel, title)
  const size = useThree((s) => s.size)
  const [_collapsed, setCollapsed] = useState(true)
  const [position, setPosition] = useState({
    x: pos === "left" ? -size.width + width + 20 : 0,
    y: 0
  })

  useEffect(() => {
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
              console.log("hello")
              setPosition(position as { x: number; y: number })
            },
            title: title
          }}
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
      ) : (
        <Leva
          titleBar={{
            position,
            onDragEnd(position) {
              console.log("hello")
              setPosition(position as { x: number; y: number })
            },
            title: title
          }}
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
