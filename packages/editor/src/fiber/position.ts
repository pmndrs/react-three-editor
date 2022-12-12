import { EditableElement, ChangeSource } from "./editable-element"
import { eq } from "./eq"

function defineProp<
  R,
  Getter extends (el: any, withDefault: boolean) => R,
  Setter extends (
    el: EditableElement,
    value: ReturnType<Getter>,
    from: ChangeSource
  ) => void
>(a: { get: Getter; set: Setter }) {
  return a
}

export const position = defineProp({
  get(el, withDefault) {
    return el.ref
      ? el.ref.position.toArray()
      : el.props?.position ?? withDefault
      ? [0, 0, 0]
      : undefined
  },
  set(el, value, from) {
    if (from === ChangeSource.TransformControls && Array.isArray(value)) {
      if (eq.array(el.store?.get("transform.position"), value)) return
      // when we get an update from the transform controls, we know that the `ref` and the
      // transformControls are correctly set. We need to set the leva controls, mark it dirty,
      // and set the props if needed
      el.store?.setValueAtPath("transform.position", value, false)
      el.store?.setSettingsAtPath("save", {
        disabled: false,
        changed: {
          position: value?.map((v) => Number(v.toFixed(3)))
        }
      })
      if (el.props) {
        el.props.position = value
        el.render()
      }
    } else if (from === ChangeSource.Leva && Array.isArray(value)) {
      // when we get an update from leva, we need to set the position on the element, which will also set it for the transform controls, we need to mark it dirty,
      el.ref?.position.set(...(value as [number, number, number]))
      el.store?.setSettingsAtPath("save", {
        disabled: false,
        changed: {
          position: value.map((v) => Number(v.toFixed(3)))
        }
      })
      if (el.props) {
        el.props.position = value
        el.render()
      }
    }
  }
})
