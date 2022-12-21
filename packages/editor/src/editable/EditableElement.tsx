import { useHelper } from "@react-three/drei"
import { LevaInputs } from "leva"
import { StoreType } from "leva/dist/declarations/src/types"
import { mergeRefs } from "leva/plugin"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Event, Object3D } from "three"
import { createLevaStore } from "./controls/createStore"
import { helpers } from "./controls/helpers"
import { Editor, useEditorStore } from "./Editor"

export type JSXSource = {
  fileName: string
  lineNumber: number
  columnNumber: number
  moduleName: string
  componentName: string
  elementName: string
}

/**
 * An editable element is a wrapper around a React element that can be edited in the editor.
 *
 * Ideally, a subset of your React app would be wrapped in editable elements, maybe just React components
 * and not the primitives. Depends on your use case.
 *
 * This element is tightly integrated with the editor, and is not meant to be used outside of it.
 *
 * It contains all information about the React element that was rendered by it, including refs, props,
 * hooks into the render cycle, place in the react tree compared to other editable elements, etc.
 *
 * It also contains a leva store, which is used to edit the props of the element. It can be rendered using a
 * leva panel, or a custom UI.
 *
 * It tracks changes to the props, and can be used to update the React element. Furthermore, it can be used to
 * write the changes to you React code base, so that you don't have to copy and paste your changes from some devtools
 * and you don't loose control of your code.
 *
 * */
export class EditableElement<
  Ref extends { name?: string } = any
> extends EventTarget {
  object?: Object3D<Event>
  ref?: Ref
  childIds: string[] = []
  changes: Record<string, Record<string, any>> = {}
  forwardedRef: boolean = false
  props: any = {}
  dirty: any = false
  store: StoreType | null = createLevaStore()
  editor: Editor = {} as any
  constructor(
    public id: string,
    public source: JSXSource,
    public type: any,
    public parentId?: string | null,
    public currentProps: any = {}
  ) {
    super()
  }

  index: string | undefined

  refs = {
    setKey: null as Dispatch<SetStateAction<number>> | null,
    forceUpdate: null as Dispatch<SetStateAction<number>> | null
  }

  mounted: boolean = false

  remount() {
    this.refs.setKey?.((i) => i + 1)
  }

  render() {
    this.refs.forceUpdate?.((i) => i + 1)
  }

  update(source: JSXSource, props: any) {
    this.source = source
    this.currentProps = { ...props }

    if (this.store?.get("name")) {
      this.store?.setValueAtPath("name", this.displayName, true)
    }
  }

  useRenderKey(forwardRef?: any) {
    const [key, setSey] = useState(0)
    const [_, forceUpdate] = useState(0)
    const [mounted, setMounted] = useState(false)

    this.refs.setKey = setSey
    this.refs.forceUpdate = forceUpdate
    this.forwardedRef = forwardRef ? true : false
    this.mounted = mounted

    useEffect(() => {
      this.store?.addData(
        {
          name: {
            value: this.displayName,
            type: LevaInputs.STRING,
            label: "name",
            render: () => false
          }
        },
        false
      )
    }, [])

    return {
      ref: mergeRefs([
        forwardRef === true ? null : forwardRef,
        (el: any) => {
          if (el) {
            this.setRef(el)
          }
        },
        (el) => setMounted(true)
      ]),
      mounted,
      key
    }
  }

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
    return `${this.source.moduleName}:${this.source.componentName ?? "_"}:${
      this.elementName
    }:${this.source.lineNumber}:${this.source.columnNumber}`
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

    if (this.ref?.name?.length && this.ref.name !== this.key) {
      return this.ref.name
    }

    if (this.currentProps["name"]) {
      return this.currentProps["name"]
    }

    if (componentName) {
      return `${
        componentName.length > remainingSlot
          ? componentName.slice(0, remainingSlot) + "…"
          : componentName
      }.${elementName}`
    }

    return elementName
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

    const isSelected = useEditorStore((state) => state.selectedId === this.id)

    let ref =
      props[arg0] === "all"
        ? this
        : props[arg0] === "selected" && isSelected
        ? this
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
      action_type: "updateAttribute",
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
    return this.childIds
      .map((id) => this.editor.getElementById(id)!)
      .filter(Boolean)
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
        let edit = this.editor.getEditableElement(el)
        if (edit) {
          editable = edit
          remainingPath = path.slice(i + 1)
        }
      }
    }
    return [el, editable, remainingPath]
  }
}
