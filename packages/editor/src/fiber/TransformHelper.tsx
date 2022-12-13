import { applyProps } from "@react-three/fiber"
import React, { useEffect, useMemo } from "react"
import { Object3D } from "three"
import { EditableElement } from "../editable/EditableElement"

export function TransformHelper({
  editableElement: element,
  props
}: {
  editableElement: EditableElement
  props: any
}) {
  const item = useMemo(() => new Object3D(), [])

  useEffect(() => {
    if (props.position || props.rotation || props.scale) {
      element.ref = item

      applyProps(item as unknown, {
        position: props.position,
        rotation: props.rotation,
        scale: props.scale
      })
    }
  }, [item])

  return <primitive object={item} />
}
