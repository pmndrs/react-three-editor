/* eslint-disable react-hooks/rules-of-hooks */
import { EditableElement, Editor } from "@editable-jsx/core"
import { multiToggle } from "@editable-jsx/ui"
import { useBounds, useHelper } from "@react-three/drei"
import { FC, useCallback } from "react"
import { Object3D } from "three"

class ThreeEditableElement extends EditableElement {
  useHelper(arg0: string, helper: any, ...args: any[]): void {
    const isEditing = this.editor.useStates("editing")
    const prop = this.editor.useSettings("helpers", {
      [arg0]: multiToggle({
        label: arg0,
        data: "selected",
        options: ["all", "selected", "none"]
      })
    })[arg0]

    const isSelected = this.useIsSelected()

    let ref = isEditing
      ? prop === "all"
        ? this
        : prop === "selected" && isSelected
        ? this
        : undefined
      : undefined

    // @ts-ignore
    useHelper(ref as any, helper, ...(args ?? []))
  }

  setObject3D(item: Object3D<Event>) {
    this.object = item
  }

  getObject3D() {
    return this.object || this.ref
  }

  isObject3D() {
    return this.object || this.ref instanceof Object3D
  }

  object
}

export class ThreeEditor extends Editor {
  ContextBridge!: FC
  elementConstructor = ThreeEditableElement
  findEditableElement(obj: any) {
    return obj?.__r3f?.editable
  }

  camera: unknown
  bounds!: ReturnType<typeof useBounds>

  useElement(
    Component: any,
    props: any,
    forwardRef?: any
  ): [EditableElement, any] {
    let [element, overrideProps] = super.useElement(
      Component,
      props,
      forwardRef
    )

    return [
      element,
      {
        ...overrideProps,
        onPointerUp:
          Component === "root"
            ? undefined
            : useCallback(
                (e: any) => {
                  if (this.state.matches("editing")) {
                    props.onPointerUp?.(e)
                    e.stopPropagation()
                    element.editor.select(element)
                  }
                },
                [element]
              )
      }
    ]
  }

  setRef(element: any, ref: any) {
    if (ref.__r3f) {
      ref.__r3f.editable = element
    }
  }
}
