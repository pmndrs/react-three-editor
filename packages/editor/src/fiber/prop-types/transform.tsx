import { folder } from "leva"
import { PropInput } from "./core/types"
import { primitives } from "./primitives"

export const transform = (props: PropInput) => {
  return folder(
    {
      position: primitives.vector3d({
        element: props.element,
        path: ["ref", "position"],
        step: 0.1
      }),
      rotation: primitives.euler({
        step: 1,
        path: ["ref", "rotation"],
        element: props.element
      }),
      scale: primitives.vector3d({
        element: props.element,
        path: ["ref", "scale"],
        lock: true,
        step: 0.1
      })
    },
    {
      collapsed: false
    }
  )
}
