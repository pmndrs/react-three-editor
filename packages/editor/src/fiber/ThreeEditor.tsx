/* eslint-disable react-hooks/rules-of-hooks */
import { Editor } from "@editable-jsx/core/Editor"
import { useBounds } from "@react-three/drei"
import { levaStore } from "leva"
import { useCallback } from "react"

// @ts-ignore
levaStore.store = undefined

export class ThreeEditor extends Editor {
  findEditableElement(obj: any) {
    return obj?.__r3f?.editable
  }

  setMode(value: any) {
    this.settingsPanel.setValueAtPath(this.modePath, value, true)
    switch (value) {
      case "editor":
        this.remount?.()
    }
  }

  camera: unknown
  bounds!: ReturnType<typeof useBounds>

  useElement(Component: any, props: any, forwardRef?: any): [Editable, any] {
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
