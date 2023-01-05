import { EditableElement } from "@editable-jsx/editable/EditableElement"
import { applyProps } from "@react-three/fiber"
import { useEffect, useMemo } from "react"
import { Object3D } from "three"

export function TransformHelper({
  editableElement: element,
  props
}: {
  editableElement: EditableElement
  props: any
}) {
  const item = useMemo(() => new Object3D(), [])
  element.setObject3D(item)

  useEffect(() => {
    if (props.position || props.rotation || props.scale) {
      applyProps(item as unknown as any, {
        position: props.position,
        rotation: props.rotation,
        scale: props.scale
      })
    }
  }, [item])

  return <primitive object={item} />
}
