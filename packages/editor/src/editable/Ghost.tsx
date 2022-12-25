// Use the useThree hook to get the pointer data
// Use th pointer data to get the mouse position and render the given children at the mouse position

import { useSelector } from "@xstate/react"
import { useEffect, useRef } from "react"
import { panelService } from "../ui/panels/panelService"
import { TitleWithFilter } from "../ui/panels/PanelTitle"

export function PanelGhost({ panel }) {
  let ref = useRef<HTMLDivElement>(null)
  const dragging = useSelector(panelService, (s) =>
    s.matches("dragging") && s.context.draggingPanel === panel
      ? s.context.draggingPanel
      : null
  )

  useEffect(() => {
    return panelService.subscribe((s) => {
      if (ref.current) {
        ref.current.style.top = `${s.context.dragPosition.y}px`
        ref.current.style.left = `${s.context.dragPosition.x + 100}px`
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
