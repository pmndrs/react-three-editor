import { useHelper } from "@react-three/drei"
import { StoreType } from "leva/dist/declarations/src/types"
import { useEffect, useState } from "react"
import { Event, Object3D } from "three"
import { helpers } from "../fiber/controls/helpers"
import { getEditableElement } from "../fiber/controls/prop"
import { ThreeEditor } from "../fiber/ThreeEditor"
import { useEditorStore } from "./Editor"

export type JSXSource = {
  fileName: string
  lineNumber: number
  columnNumber: number
  moduleName: string
  componentName: string
  elementName: string
}

export class EditableElement<
  Ref extends { name?: string } = any
> extends EventTarget {
  object?: Object3D<Event>
  ref?: Ref
  currentProps: any
  childIds: string[] = []
  changes: Record<string, Record<string, any>> = {}
  forwardedRef: boolean = false
  props: any = {}
  render: () => void = () => {}
  dirty: any = false
  store: StoreType | null = null
  editor: ThreeEditor = {} as any
  constructor(
    public id: string,
    public source: JSXSource,
    public type: any,
    public parentId?: string | null
  ) {
    super()
  }

  index: string | undefined

  get treeId(): string {
    return this.parent?.index !== undefined
      ? this.parent.treeId + "-" + this.index
      : this.index!
  }

  get current() {
    return this.ref
  }

  get key() {
    if (this.source.moduleName === this.source.componentName) {
      return `${this.source.componentName}:${this.elementName}:${this.source.lineNumber}:${this.source.columnNumber}`
    }
    return `${this.source.moduleName}:${this.source.componentName}:${this.elementName}:${this.source.lineNumber}:${this.source.columnNumber}`
  }

  get name() {
    return this.ref?.name?.length ? this.ref.name : this.key
  }

  setRef(el: Ref) {
    this.ref = el
    this.editor.setRef(this, el)
    this.dispatchEvent(
      new CustomEvent("ref-changed", {
        detail: {
          ref: el
        }
      })
    )
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

  resetControls() {}

  get elementName() {
    return this.source.elementName
      ? this.source.elementName
      : typeof this.type === "string"
      ? this.type
      : this.type.displayName || this.type.name
  }

  get displayName() {
    let componentName = this.source.componentName
    let elementName = this.elementName
    let remainingSlot = 30 - this.elementName.length
    return this.ref?.name?.length && this.ref.name !== this.key
      ? this.ref.name
      : `${
          componentName.length > remainingSlot
            ? componentName.slice(0, remainingSlot) + "…"
            : componentName
        }.${elementName}`
  }

  set name(v: string) {
    if (this.ref) {
      this.ref.name = v
    }
  }

  get visible() {
    return this.ref?.visible ?? true
  }

  set visible(v: boolean) {
    if (this.ref) {
      this.ref.visible = v
    }
  }

  remount: () => void = () => {}
  useVisible(): [any, any] {
    const [visible, setVisible] = useState(true)
    return [visible, setVisible]
  }
  useHelper(arg0: string, helper: any, ...args: any[]) {
    const [props] = this.editor.useSettings("helpers", {
      [arg0]: helpers({
        label: arg0
      })
    })
    const isEditorMode = this.editor
      .getPanel(this.editor.settingsPanel)
      .useStore((s) => this.editor.isEditorMode())
    const isSelected = useEditorStore((state) => state.selectedId === this.id)

    let ref = isEditorMode
      ? props[arg0] === "all"
        ? this
        : props[arg0] === "selected" && isSelected
        ? this
        : undefined
      : undefined

    // @ts-ignore
    useHelper(ref as any, helper, ...(args ?? []))
  }
  useCollapsed(): [any, any] {
    let storedCollapsedState =
      this.editor.expanded.size > 0
        ? this.editor.expanded.has(this.treeId)
          ? false
          : true
        : !this.editor.isSelected(this) && this.isPrimitive()
    const [collapsed, setCollapsed] = useState(storedCollapsedState)

    useEffect(() => {
      if (collapsed) {
        this.editor.expanded.delete(this.treeId)
        localStorage.setItem(
          "collapased",
          JSON.stringify(Array.from(this.editor.expanded))
        )
      } else {
        this.editor.expanded.add(this.treeId)
        localStorage.setItem(
          "collapased",
          JSON.stringify(Array.from(this.editor.expanded))
        )
      }
    }, [collapsed])

    return [collapsed, setCollapsed]
  }

  isPrimitive(): boolean {
    return (
      this.elementName.charAt(0) === this.elementName.charAt(0).toLowerCase() &&
      !(this.elementName === "group")
    )
  }

  addChange(element: EditableElement, prop: string, value: any) {
    if (!this.changes[element.id]) {
      this.changes[element.id] = { _source: element.source }
    }
    this.changes[element.id][prop] = value
  }

  get changed() {
    let data = this.store?.getData()!
    if (data && data["save"]) {
      return !data["save"].settings.disabled
    }

    return this.dirty
  }

  set changed(value) {
    let data = this.store?.getData()!
    if (data && data["save"]) {
      this.store?.setSettingsAtPath("save", {
        disabled: !value
      })
    } else {
      this.store?.useStore.setState((s) => ({ ...s }))
    }

    this.dirty = value
  }

  changeProp(arg0: string, arg1: number[]) {
    this.addChange(this, arg0, arg1)
    this.changed = true
    this.setProp(arg0, arg1)
  }

  setProp(arg0: string, arg1: any) {
    if (!this.forwardedRef || this.type !== "string" || arg0 === "args") {
      this.props[arg0] = arg1
      this.render()
    }
  }

  get controls() {
    let controls = {}
    let entity = this
    this.editor.plugins.forEach((plugin) => {
      if (plugin.controls && plugin.applicable(entity)) {
        Object.assign(controls, plugin.controls(entity))
      }
    })

    return controls
  }

  get icon() {
    for (var i = this.editor.plugins.length - 1; i >= 0; i--) {
      let plugin = this.editor.plugins[i]
      if (plugin.icon && plugin.applicable(this)) {
        return plugin.icon(this)
      }
    }

    return "ph:cube"
  }

  async save() {
    let diffs = Object.values(this.changes).map(({ _source, ...value }) => ({
      value,
      source: _source
    }))

    await this.editor.save(diffs)
    this.changes = {}
    this.changed = false

    // this.openInEditor()
  }

  async openInEditor() {
    fetch(
      `/__open-in-editor?file=${encodeURIComponent(
        `${this.source.fileName}:${this.source.lineNumber}:${
          this.source.columnNumber + 1
        }`
      )}`
    )
  }

  get children() {
    return this.childIds.map((id) => this.editor.getElementById(id)!)
  }

  get parent() {
    return this.editor.getElementById(this.parentId!)
  }

  getObjectByPath<T>(path: string[]): T {
    let el: any = this
    for (let i = 0; i < path.length; i++) {
      el = el?.[path[i]]
    }
    return el
  }

  getEditableObjectByPath(path: string[]) {
    let el: any = this
    let editable: any = this
    let remainingPath = path
    if (path.length > 1) {
      for (let i = 0; i < path.length - 1; i++) {
        el = el?.[path[i]]
        let edit = getEditableElement(el)
        if (edit) {
          editable = edit
          remainingPath = path.slice(i + 1)
        }
      }
    }
    return [el, editable, remainingPath]
  }
}
