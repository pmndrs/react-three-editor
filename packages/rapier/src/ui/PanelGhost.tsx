// Use the useThree hook to get the pointer data
// Use th pointer data to get the mouse position and render the given children at the mouse position

import { useEffect, useRef } from "react"
import { usePanelManager } from "../usePanelManager"
import { TitleWithFilter } from "./PanelTitle"

export function PanelGhost({ panel }: { panel: string }) {
  let ref = useRef<HTMLDivElement>(null)
  const panels = usePanelManager()
  const dragging = panels.useState((s) =>
    !s.matches("idle") && s.context.draggingPanel === panel
      ? s.context.draggingPanel
      : null
  )

  useEffect(() => {
    return panels.subscribe((s) => {
      if (ref.current) {
        ref.current.style.top = `${s.event.event.movement[1]}px`
        ref.current.style.left = `${s.event.event.movement[0] + 100}px`
      }
    }).unsubscribe
  }, [panels])

  return dragging ? (
    <TitleWithFilter
      title={dragging}
      setFilter={() => {}}
      toggle={() => {}}
      ref={ref}
      ghost
      filterEnabled={true}
    />
  ) : null
}
