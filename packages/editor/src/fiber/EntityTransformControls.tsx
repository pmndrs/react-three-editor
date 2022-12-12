import { PivotControls, TransformControls } from "@react-three/drei"
import { MathUtils, Object3D, Event } from "three"
import { TransformControls as TransformControlsImpl } from "three-stdlib"
import { useEffect, useRef } from "react"
import React from "react"
import { levaStore } from "leva"
import { createPortal } from "@react-three/fiber"
import { ChangeSource, EditableElement } from "./editable-element"
import { mergeRefs } from "leva/plugin"



export function EntityTransformControls({
  entity
}: {
  entity: EditableElement
}): JSX.Element {
  let ref = useRef<TransformControlsImpl>(null)
  useEffect(() => {
    //   if (ref.current) {
    //     ref.current.layers.mask = bitmask(Layers.Default, 1)
    //     // @ts-expect-error
    //     ref.current.raycaster.layers.mask = bitmask(Layers.Default, 1)
    //     // @ts-expect-error
    //     ref.current.camera.layers.mask = bitmask(Layers.Default, 1)
    //     ref.current.traverse((o) => {
    //       o.layers.mask = bitmask(Layers.Default, 1)
    //     })
    //   }

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
      object={entity.ref!}
      ref={mergeRefs([
        ref,
        (r: TransformControlsImpl) => {
          entity.transformControls$ = r
        }
      ])}
      key={entity.id}
      onChange={(c: Event | undefined) => {
        if (c?.type === "change" && entity.ref && c.target?.object) {
          entity.setProp(
            "position",
            c.target.object.position.toArray(),
            ChangeSource.TransformControls
          )
          entity.setProp(
            "rotation",
            [
              MathUtils.radToDeg(c.target.object.rotation.x),
              MathUtils.radToDeg(c.target.object.rotation.y),
              MathUtils.radToDeg(c.target.object.rotation.z)
            ],
            ChangeSource.TransformControls
          )
          entity.setProp(
            "scale",
            c.target.object.scale.toArray(),
            ChangeSource.TransformControls
          )
        }
      }}
    />
  )
}
