/* eslint-disable react-hooks/rules-of-hooks */
import { useBounds } from "@react-three/drei"
import { levaStore } from "leva"
import { useCallback } from "react"
import { EditableElement } from "../editable"
import { Editor } from "../editable/Editor"

// @ts-ignore
levaStore.store = undefined

export class ThreeEditor extends Editor {
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
          Component === "canvas"
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
