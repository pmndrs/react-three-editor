import { useThree } from "@react-three/fiber"
import { folder, LevaPanel, useControls } from "leva"
import { useEffect, useState } from "react"
import { tree } from "../editable/controls/tree/tree"
import { useEditor, useEditorStore } from "../editable/Editor"
import { In } from "./CanvasTunnel"

export function SceneControls() {
  const p = useEditorStore((state) => Object.values(state.elements))

  useControls(() => {
    const items: Record<string, any> = {}
    p.forEach((v) => {
      if (v.parentId == null) items[v.id] = v
    })

    return {
      scene: folder(
        {
          graph: tree({
            items,
            scrollable: true
          })
        },
        {
          order: -2
        }
      )
    }
  }, [p])
  return null
}

export function ScenePanel({ collapsed = false }) {
  const editor = useEditor()
  const p = useEditorStore((state) => Object.values(state.elements))
  const items: Record<string, any> = {}
  p.forEach((v) => {
    if (v.parentId == null) items[v.id] = v
  })

  let panelStore = editor.usePanel("scene")

  useControls(
    {
      graph: tree({
        items,
        scrollable: false
      })
    },
    { store: panelStore },
    [items]
  )
  const size = useThree((s) => s.size)
  const [_collapsed, setCollapsed] = useState(true)
  const [position, setPosition] = useState({
    x: -size.width + 320,
    y: 0
  })

  useEffect(() => {
    setCollapsed(collapsed)
  }, [collapsed])

  useEffect(() => {
    setPosition({ x: -size.width + 320, y: 0 })
  }, [size])

  return (
    <In>
      <LevaPanel
        store={panelStore}
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
          }
        }}
        collapsed={{ collapsed: _collapsed, onChange: setCollapsed }}
      />
    </In>
  )
}
