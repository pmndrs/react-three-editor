// Use the useThree hook to get the pointer data
// Use th pointer data to get the mouse position and render the given children at the mouse position

import { useEffect, useRef } from "react"
import { Panel } from "./PanelManager"
import { useEditor } from "../useEditor"

export function PanelGhost({ panel }: { panel: Panel }) {
  let ref = useRef<HTMLDivElement>(null)
  const editor = useEditor()
  const dragging = editor.panels.useState((s) =>
    !s.matches("idle") && s.context.draggingPanel === panel
      ? s.context.draggingPanel
      : null
  )

  useEffect(() => {
    return editor.panels.subscribe((s) => {
      if (ref.current) {
        ref.current.style.top = `${s.event.event.movement[1]}px`
        ref.current.style.left = `${s.event.event.movement[0] + 100}px`
      }
    }).unsubscribe
  }, [])

  return dragging ? (
    <TitleWithFilter
      title={dragging}
      setFilter={() => {}}
      toggle={() => {}}
      ref={ref}
      ghost
    />
  ) : null
}
