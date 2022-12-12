import { TransformControls } from "@react-three/drei"
import { MathUtils, Event } from "three"
import { TransformControls as TransformControlsImpl } from "three-stdlib"
import { useEffect, useRef } from "react"
import React from "react"
import { EditableElement } from "../editable/EditableElement"
import { mergeRefs } from "leva/plugin"
import { eq } from "../editable/eq"
export function ElementTransformControls({
  element
}: {
  element: EditableElement
}): JSX.Element {
  let ref = useRef<TransformControlsImpl>(null)
  useEffect(() => {
    function keyDown(event: KeyboardEvent) {
      let control = ref.current
      if (!control) return
      switch (event.keyCode) {
        case 16: // Shift
          // control.setTranslationSnap(0.5)
          // control.setRotationSnap(MathUtils.degToRad(15))
          // control.setScaleSnap(0.25)
          break

        case 87: // W
          control.setMode("translate")
          break

        case 69: // E
          control.setMode("rotate")
          break

        case 82: // R
          control.setMode("scale")
          break

        case 187:
        case 107: // +, =, num+
          control.setSize(control.size + 0.1)
          break

        case 189:
        case 109: // -, _, num-
          control.setSize(Math.max(control - 0.1, 0.1))
          break

        case 88: // X
          control.showX = !control.showX
          break

        case 89: // Y
          control.showY = !control.showY
          break

        case 90: // Z
          control.showZ = !control.showZ
          break

        case 32: // Spacebar
          control.enabled = !control.enabled
          break

        case 27: // Esc
          control.reset()
          break
      }
    }
    window.addEventListener("keydown", keyDown)
    let keyUp = function (event) {
      let control = ref.current
      if (!control) {
        return
      }
      switch (event.keyCode) {
        case 16: // Shift
          control.setTranslationSnap(null)
          control.setRotationSnap(null)
          control.setScaleSnap(null)
          break
      }
    }

    window.addEventListener("keyup", keyUp)
    return () => {
      window.removeEventListener("keydown", keyDown)
      window.removeEventListener("keyup", keyUp)
    }
  })
  return (
    <TransformControls
      object={element.ref!}
      ref={mergeRefs([
        ref,
        (r: TransformControlsImpl) => {
          element.transformControls$ = r
        }
      ])}
      key={element.id}
      onChange={(c: Event | undefined) => {
        if (c?.type === "change" && element.ref && c.target?.object) {
          let position = c.target.object.position.toArray()
          if (eq.array(element.store?.get("transform.position"), position))
            return
          // when we get an update from the transform controls, we know that the `ref` and the
          // transformControls are correctly set. We need to set the leva controls, mark it dirty,
          // and set the props if needed
          element.store?.setValueAtPath("transform.position", position, false)
          element.dirtyProp(
            "position",
            position?.map((v) => Number(v.toFixed(3)))
          )

          let rotation = [
            MathUtils.radToDeg(c.target.object.rotation.x),
            MathUtils.radToDeg(c.target.object.rotation.y),
            MathUtils.radToDeg(c.target.object.rotation.z)
          ]
          if (eq.angles(element.store?.get("transform.rotation"), rotation))
            return
          // when we get an update from the transform controls, we know that the `ref` and the
          // transformControls are correctly set. We need to set the leva controls, mark it dirty,
          // and set the props if needed
          let radians = rotation.map((v) => MathUtils.degToRad(v))
          element.store?.setValueAtPath("transform.rotation", rotation, false)
          element.dirtyProp(
            "rotation",
            radians?.map((v) => Number(v.toFixed(3)))
          )

          let scale = c.target.object.scale.toArray()
          if (eq.array(element.store?.get("transform.scale"), scale)) return
          // when we get an update from the transform controls, we know that the `ref` and the
          // transformControls are correctly set. We need to set the leva controls, mark it dirty,
          // and set the props if needed
          element.store?.setValueAtPath("transform.scale", scale, false)
          element.dirtyProp(
            "scale",
            scale?.map((v) => Number(v.toFixed(3)))
          )
        }
      }}
    />
  )
}
