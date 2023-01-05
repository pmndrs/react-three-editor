import { useDrag } from "@use-gesture/react"
import { useRef } from "react"
import { store } from "./Game"
import sphereImg from "./sphere.png"

function ImageItem() {
  const tagRef = useRef<HTMLDivElement>(null!)
  const bind = useDrag(
    ({ first, last, movement, event, memo = { x: 0, y: 0 } }) => {
      if (first) {
        tagRef.current.style.display = "block"
        memo.x = (event as any).nativeEvent.offsetX + 5
        memo.y = (event as any).nativeEvent.offsetY - 5
        store.isDragging = true
      }
      if (last) {
        tagRef.current.style.display = "none"
        store.isDragging = false
      }

      if (event.target === store.canvas) {
        tagRef.current.style.display = "none"
        return
      }

      tagRef.current.style.transform = `translateX(${
        movement[0] + memo.x
      }px) translateY(${movement[1] + memo.y}px)`

      return memo
    },
    {
      pointer: {
        capture: false
      }
    }
  )

  return (
    <div style={{ position: "relative" }}>
      <div ref={tagRef} className="image-tag">
        Sphere
      </div>
      <div
        {...bind()}
        className="image-item"
        style={{ backgroundImage: `url(${sphereImg})` }}
      />
    </div>
  )
}

export function ImageList() {
  return (
    <div className="image-list">
      <ImageItem />
      <ImageItem />
      <ImageItem />
      <ImageItem />
    </div>
  )
}
