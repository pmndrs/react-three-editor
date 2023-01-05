/* eslint-disable react-hooks/rules-of-hooks */
import { EditableElement, Editor } from "@editable-jsx/editable"
import { multiToggle } from "@editable-jsx/ui"
import { useBounds, useHelper } from "@react-three/drei"
import { Size, useStore } from "@react-three/fiber"
import { FC, PropsWithChildren, useCallback } from "react"
import { Camera, Object3D, Raycaster, Scene } from "three"

export class ThreeEditableElement extends EditableElement {
  object3D?: Object3D

  useHelper(arg0: string, helper: any, ...args: any[]): void {
    const isEditing = this.editor.useStates("editing")
    const prop = this.editor.useSettings("helpers", {
      [arg0]: multiToggle({
        label: arg0,
        data: "selected",
        options: ["all", "selected", "none"] as const
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
    this.object3D = item
  }

  getObject3D() {
    return this.object3D || this.ref
  }

  isObject3D() {
    return this.object3D || this.ref instanceof Object3D
  }
}

export class ThreeEditor extends Editor {
  ContextBridge!: FC<PropsWithChildren>
  elementConstructor = ThreeEditableElement
  threeStore!: ReturnType<typeof useStore>
  canvasSize!: Size
  scene!: Scene
  camera!: Camera
  raycaster!: Raycaster
  bounds!: ReturnType<typeof useBounds>

  findEditableElement(obj: any) {
    return obj?.__r3f?.editable
  }

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
