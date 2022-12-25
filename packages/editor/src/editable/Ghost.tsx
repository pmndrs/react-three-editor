// Use the useThree hook to get the pointer data
// Use th pointer data to get the mouse position and render the given children at the mouse position

import { useEffect, useRef } from "react"
import { panelService } from "../ui/panels/panelService"
import { In } from "../ui/tunnel"

export function PanelGhost() {
  let ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panelService.subscribe((s) => {
      if (ref.current) {
        ref.current.style.top = `${s.context.dragPosition.y}px`
        ref.current.style.left = `${s.context.dragPosition.x}px`
      }
    })
  }, [])
  // useFrame((s) => {
  //   if (ref.current) {
  //     console.log(s.mouse, s.pointer)
  //     ref.current.style.top = `${s.mouse.y}%`
  //     ref.current.style.left = `${s.mouse.x}%`
  //   }
  // })
  return (
    <In>
      <div
        ref={ref}
        style={{
          position: "fixed",
          height: 10,
          width: 10,
          backgroundColor: "red"
        }}
      ></div>
    </In>
  )
}
