import { EditableElement } from "@editable-jsx/editable"
import { multiToggle } from "@editable-jsx/ui"
import { useHelper } from "@react-three/drei"
import { applyProps } from "@react-three/fiber"
import { ReactNode, useEffect, useMemo } from "react"
import { BoxHelper, Group } from "three"

export function BoundsHelper({
  editableElement: element,
  props,
  children
}: {
  editableElement: EditableElement
  props: any
  children: ReactNode
}) {
  const item = useMemo(() => new Group(), [])

  // @ts-ignore
  element.bounds = item

  const { bounds } = element.editor.useSettings("helpers", {
    bounds: multiToggle({
      data: "selected",
      options: ["all", "selected", "none"]
    })
  })

  const isSelected = element.useIsSelected()

  let ref =
    bounds === "all"
      ? { current: item }
      : bounds === "selected" && isSelected
      ? { current: item }
      : undefined

  useHelper(ref, BoxHelper)

  useEffect(() => {
    if (props.position || props.rotation || props.scale) {
      applyProps(item as unknown as any, {
        position: props.position,
        rotation: props.rotation,
        scale: props.scale
      })
    }
  }, [item])

  return <primitive object={item}>{children}</primitive>
}
