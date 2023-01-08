/* eslint-disable react-hooks/rules-of-hooks */
import {
  EditableElement,
  Editor,
  RpcServerFunctions
} from "@editable-jsx/editable"
import { JSXSource } from "@editable-jsx/state"
import { multiToggle } from "@editable-jsx/ui"
import { useBounds, useHelper as useHelperDrei } from "@react-three/drei"
import { Size, useStore } from "@react-three/fiber"
import { BirpcReturn } from "birpc"
import { FC, PropsWithChildren, useCallback, useEffect } from "react"
import { Camera, Object3D, Raycaster, Scene } from "three"
import { Root } from "./root/createEditorRoot"

export type EditableObject3D = THREE.Object3D & {
  __r3f: {
    editable: ThreeEditableElement
  }
}

export class ThreeEditableElement extends EditableElement {
  object3D?: Object3D

  constructor(
    id: string,
    source: JSXSource,
    type: any,
    parentId?: string | null | undefined,
    currentProps?: any
  ) {
    super(id, source, type, parentId, currentProps)
  }

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
    useHelperDrei(ref, helper, ...(args ?? []))
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

  canvas: HTMLCanvasElement | null
  screenshotCanvas: HTMLCanvasElement | null
  editorRoot: Root | null
  appRoot: Root | null
  gizmoLayer: number

  constructor(plugins: any[], client: BirpcReturn<RpcServerFunctions>) {
    super(plugins, client)

    this.canvas = null
    this.screenshotCanvas = null
    this.editorRoot = null
    this.appRoot = null
    this.gizmoLayer = 31 // Can only be 0-31
  }

  isEditable(obj: any) {
    return obj?.__r3f?.editable ? true : false
  }

  findEditableElement(obj: any): ThreeEditableElement {
    return obj?.__r3f?.editable
  }

  findNearestEditableElement(obj: THREE.Object3D) {
    let element: ThreeEditableElement | undefined = undefined
    obj.traverseAncestors((ancestor) => {
      if (this.isEditable(ancestor as EditableObject3D)) {
        element = this.findEditableElement(ancestor)
        return
      }
    })
    return element
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

    useEffect(() => {
      const handler = () => element.editor.select(element)
      element.addEventListener("pointerup", handler)
      return () => element.removeEventListener("pointerup", handler)
    }, [])

    return [element, { ...overrideProps }]
  }

  setRef(element: any, ref: any) {
    if (ref.__r3f) {
      ref.__r3f.editable = element
    }
  }
}
