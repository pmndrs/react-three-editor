import { primitives } from "./primitives"

export const propControls = {
  applicable: (entity) => true,
  controls: (entity) => {
    let controls: Record<string, any> = {}
    if (entity.type.controls) {
      Object.entries(entity.type.controls)
        .map(([k, { type = "unknown", value, ...v }]: any) => {
          return [
            k,
            primitives[type as keyof typeof primitives]({
              ...v,
              element: entity,
              path: ["currentProps", k],
              default: value
            })
          ]
        })
        .forEach(([k, v]) => {
          controls[k] = v
        })
    }

    let IGNORED_PROPS = ["_source", "children"]

    let isControllable = (v: any) => {
      return (
        typeof v === "number" ||
        typeof v === "string" ||
        typeof v === "boolean" ||
        Array.isArray(v)
      )
    }

    Object.entries(entity.currentProps).forEach(([k, v]) => {
      if (!controls[k] && !IGNORED_PROPS.includes(k) && isControllable(v)) {
        let val = entity.currentProps[k]

        let props = {}
        if (typeof val === "number") {
          props.step = val / 100.0
          if (val % 1 === 0) {
            props.step = 1
          }
        }
        controls[k] = primitives.unknown({
          element: entity,
          path: ["currentProps", k],
          ...props
        })
      }
    })

    console.log(controls)
    return controls
  }
}
