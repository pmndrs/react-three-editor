import { useThree } from "@react-three/fiber"
import { LevaPanel } from "leva"
import { useEffect, useState } from "react"
import { useEditor } from "../editable/Editor"
import { In } from "./CanvasTunnel"

export function Panel({
  title,
  width = 320,
  collapsed = false,
  pos = "left",
  ...props
}) {
  const panel = useEditor().getPanel(title.toLowerCase())
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
      <LevaPanel
        store={panel}
        titleBar={{
          position,
          onDragEnd(position) {
            setPosition(position as { x: number; y: number })
          },
          title: "Scene"
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
    </In>
  )
}
