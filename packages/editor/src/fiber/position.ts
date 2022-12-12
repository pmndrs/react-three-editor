import { MathUtils } from "three"
import { EditableElement, ChangeSource } from "./editable-element"
import { eq } from "./eq"

export function defineProp<
  R,
  Getter extends (el: EditableElement, withDefault: boolean) => R,
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
      el.dirtyProp(
        "position",
        value?.map((v) => Number(v.toFixed(3)))
      )
    } else if (from === ChangeSource.Leva && Array.isArray(value)) {
      // when we get an update from leva, we need to set the position on the element, which will also set it for the transform controls, we need to mark it dirty,
      el.ref?.position.fromArray(value)
      el.dirtyProp(
        "position",
        value?.map((v) => Number(v.toFixed(3)))
      )
    }
  }
})

export const rotation = defineProp({
  get(el, withDefault) {
    return el.ref
      ? [
          MathUtils.radToDeg(el.ref.rotation.x),
          MathUtils.radToDeg(el.ref.rotation.y),
          MathUtils.radToDeg(el.ref.rotation.z)
        ]
      : el.props?.rotation ?? withDefault
      ? [0, 0, 0]
      : undefined
  },
  set(el, value, from) {
    if (from === ChangeSource.TransformControls && Array.isArray(value)) {
      if (eq.angles(el.store?.get("transform.rotation"), value)) return
      // when we get an update from the transform controls, we know that the `ref` and the
      // transformControls are correctly set. We need to set the leva controls, mark it dirty,
      // and set the props if needed
      let radians = value.map((v) => MathUtils.degToRad(v))
      el.store?.setValueAtPath("transform.rotation", value, false)
      el.dirtyProp(
        "rotation",
        radians?.map((v) => Number(v.toFixed(3)))
      )
    } else if (from === ChangeSource.Leva && Array.isArray(value)) {
      // when we get an update from leva, we need to set the position on the element, which will also set it for the transform controls, we need to mark it dirty,

      let radians = value.map((v) => MathUtils.degToRad(v))
      let v = [...radians, "XYZ"]
      el.ref?.rotation.fromArray(v)
      el.dirtyProp(
        "rotation",
        radians?.map((v) => Number(v.toFixed(3)))
      )
    }
  }
})

export const scale = defineProp({
  get(el, withDefault) {
    return el.ref
      ? el.ref.scale.toArray()
      : el.props?.scale ?? withDefault
      ? [0, 0, 0]
      : undefined
  },
  set(el, value, from) {
    if (from === ChangeSource.TransformControls && Array.isArray(value)) {
      if (eq.array(el.store?.get("transform.scale"), value)) return
      // when we get an update from the transform controls, we know that the `ref` and the
      // transformControls are correctly set. We need to set the leva controls, mark it dirty,
      // and set the props if needed
      el.store?.setValueAtPath("transform.scale", value, false)
      el.dirtyProp(
        "scale",
        value.map((v) => Number(v.toFixed(3)))
      )
    } else if (from === ChangeSource.Leva && Array.isArray(value)) {
      // when we get an update from leva, we need to set the position on the element, which will also set it for the transform controls, we need to mark it dirty,

      el.ref?.scale.fromArray(value)
      el.dirtyProp(
        "scale",
        value.map((v) => Number(v.toFixed(3)))
      )
    }
  }
})
