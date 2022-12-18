import { TransformControls } from "@react-three/drei"
import { mergeRefs } from "leva/plugin"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { Event, MathUtils, Object3D, Vector3Tuple } from "three"
import { TransformControls as TransformControlsImpl } from "three-stdlib"
import {
  SetElementPosition,
  SetElementRotation,
  SetElementScale
} from "../../editable/commands"
import { eq } from "../../editable/controls/eq"
import { EditableElement } from "../../editable/EditableElement"
import { EditorContext } from "../../editable/Editor"

const serializeTransform = (
  object?: Object3D
): { position: Vector3Tuple; rotation: Vector3Tuple; scale: Vector3Tuple } => ({
  position: object?.position.toArray() || [0, 0, 0],
  rotation: (object?.rotation
    .toArray()
    .map((r) => MathUtils.radToDeg(r))
    .slice(0, 3) as Vector3Tuple) || [0, 0, 0],
  scale: object?.scale.toArray() || [1, 1, 1]
})

export type ElementTransformControlsProps = {
  element: EditableElement
}

export function ElementTransformControls({
  element
}: ElementTransformControlsProps) {
  const ref = useRef<TransformControlsImpl>(null!)
  const draggingRef = useRef<boolean>(false)
  const editor = useContext(EditorContext)
  const oldTransform = useRef<{
    position: Vector3Tuple
    rotation: Vector3Tuple
    scale: Vector3Tuple
  }>({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [0, 0, 0]
  })

  useHotkeys("w", () => ref.current.setMode("translate"))
  useHotkeys("e", () => ref.current.setMode("rotate"))
  useHotkeys("r", () => ref.current.setMode("scale"))
  useHotkeys("-", () =>
    ref.current.setSize(Math.max((ref.current as any).size - 0.1, 0.1))
  )
  useHotkeys("s", () => element.changed && element.save())
  useHotkeys("=", () => ref.current.setSize((ref.current as any).size + 0.1))
  useHotkeys("meta+z", () => editor?.commandManager.undo())
  useHotkeys("meta+y", () => editor?.commandManager.redo())

  const updateElementTransforms = useCallback(
    (object: Object3D, mode: "translate" | "rotation" | "scale") => {
      const { position, rotation, scale } = serializeTransform(object)
      if (
        mode === "translate" &&
        !eq.array(element.store?.get("transform.position"), position)
      ) {
        // when we get an update from the transform controls, we know that the `ref` and the
        // transformControls are correctly set. We need to set the leva controls, mark it dirty,
        // and set the props if needed
        element.store?.setValueAtPath("transform.position", position, false)
        element.changeProp(
          "position",
          position?.map((v: number) => Number(v.toFixed(3)))
        )
      } else if (
        mode === "rotation" &&
        !eq.angles(element.store?.get("transform.rotation"), rotation)
      ) {
        // when we get an update from the transform controls, we know that the `ref` and the
        // transformControls are correctly set. We need to set the leva controls, mark it dirty,
        // and set the props if needed
        let radians = rotation.map((v) => MathUtils.degToRad(v))
        element.store?.setValueAtPath("transform.rotation", rotation, false)
        element.changeProp(
          "rotation",
          radians?.map((v) => Number(v.toFixed(3)))
        )
      } else if (
        mode === "scale" &&
        !eq.array(element.store?.get("transform.scale"), scale)
      ) {
        // when we get an update from the transform controls, we know that the `ref` and the
        // transformControls are correctly set. We need to set the leva controls, mark it dirty,
        // and set the props if needed
        element.store?.setValueAtPath("transform.scale", scale, false)
        element.changeProp(
          "scale",
          scale?.map((v: number) => Number(v.toFixed(3)))
        )
      }
    },
    [element]
  )

  useEffect(() => {
    if (ref.current) {
      const control = ref.current
      const draggingChanged = ({ value, target }: any) => {
        draggingRef.current = !!value
        if (!draggingRef.current) {
          const mode = control.getMode()
          const { position, rotation, scale } = serializeTransform(
            target.object
          )
          if (mode === "translate") {
            editor?.commandManager.execute(
              new SetElementPosition(
                editor,
                element,
                position,
                Object.assign({}, oldTransform.current).position
              )
            )
          } else if (mode === "rotation") {
            editor?.commandManager.execute(
              new SetElementRotation(
                editor,
                element,
                rotation,
                Object.assign({}, oldTransform.current).rotation
              )
            )
          } else if (mode === "scale") {
            editor?.commandManager.execute(
              new SetElementScale(
                editor,
                element,
                scale,
                Object.assign({}, oldTransform.current).scale
              )
            )
          }
        } else {
          oldTransform.current = serializeTransform(target.object)
        }
      }
      control.addEventListener("dragging-changed", draggingChanged)
      return () => {
        control.removeEventListener("dragging-changed", draggingChanged)
      }
    }
  }, [element])

  const onChange = useCallback(
    (event?: Event) => {
      if (
        event?.type === "change" &&
        element.isObject3D() &&
        event.target?.object &&
        draggingRef.current
      ) {
        const mode = event.target.getMode()
        updateElementTransforms(event.target.object, mode)
      }
    },
    [updateElementTransforms]
  )

  const [object, setRef] = useState(element.getObject3D())

  useEffect(() => {
    element.addEventListener("ref-changed", (e) => {
      // setRef(e.detail.ref)
    })
  }, [element])

  return (
    <TransformControls
      object={object}
      key={element.id}
      ref={mergeRefs([
        ref,
        (r: TransformControlsImpl) => {
          // element.transformControls$ = r
        }
      ])}
      onChange={onChange}
    />
  )
}
