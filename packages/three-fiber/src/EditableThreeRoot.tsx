/* eslint-disable react-hooks/rules-of-hooks */
import {
  EditableElement,
  EditableRoot,
  useEditor
} from "@editable-jsx/editable"
import { JSXSource } from "@editable-jsx/state"
import { multiToggle } from "@editable-jsx/ui"
import { useBounds, useHelper } from "@react-three/drei"
import { Size, useStore } from "@react-three/fiber"
import { FC, PropsWithChildren } from "react"
import { Camera, Object3D, Raycaster, Scene } from "three"
import { EditableCanvas } from "./EditableCanvas"
import { Root } from "./root/createEditorRoot"

export class EditableThreeElement extends EditableElement {
  object3D?: Object3D

  useHelper(arg0: string, helper: any, ...args: any[]): void {
    const editor = useEditor()
    const isEditing = editor.useStates("editing")
    const prop = editor.useSettings("helpers", {
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

export class EditableThreeRoot extends EditableRoot {
  contextBridge!: FC<PropsWithChildren>
  elementConstructor = EditableThreeElement
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

  constructor(id: string, source: JSXSource) {
    super(id, source, EditableCanvas as any)
    this.canvas = null
    this.screenshotCanvas = null
    this.editorRoot = null
    this.appRoot = null
  }
}
