/* eslint-disable react-hooks/rules-of-hooks */
import { EditableElement, Editor } from "@editable-jsx/core"
import { useBounds } from "@react-three/drei"
import { FC, useCallback } from "react"

export class ThreeEditor extends Editor {
  ContextBridge!: FC
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
