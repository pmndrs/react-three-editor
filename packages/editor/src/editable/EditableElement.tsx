/* eslint-disable react-hooks/rules-of-hooks */
import { useHelper } from "@react-three/drei"
import { LevaInputs } from "leva"
import { StoreType } from "leva/dist/declarations/src/types"
import { mergeRefs } from "leva/plugin"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Event, Object3D } from "three"
import { JSXSource } from "../types"
import { multiToggle } from "../ui/leva/multiToggle"
import { createLevaStore } from "./createStore"
import { Editor } from "./Editor"

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
  Ref extends { name?: string; visible?: boolean } = any
> extends EventTarget {
  useName() {
    return this.store?.useStore((s) => s.data["name"].value)
  }
  useChildren() {
    return this.editor.store((s) => [...(s.elements[this.id]?.children ?? [])])
  }
  useIsDirty() {
    return this.store?.useStore((s) => Object.keys(this.changes).length > 0)
  }

  handlePropChange = (change: PropChange) => {
    let { input, type, path, context } = change
    // using the path, figure out the object that needs to be edited, the
    // closest editable JSX element, and the path from the closest editable
    // JSX element to the prop that needs to be edited
    const [object, closestEditable, remainingPath] =
      this.getEditableObjectByPath(path)

    // the last item in the path is the prop that needs to be edited
    const prop = path[path.length - 1]

    // if the type has an init function, call it with the object, prop, and value, useful to some side effect on initialization from the control representation of the prop,
    // this should be used sparingly, and the `get` function should be used to change the data representation of the prop to the control representation
    if (input !== null && type.init && context.initial) {
      type.init?.(object, prop, input)
    }

    if (
      input === null ||
      !context.fromPanel ||
      context.initial ||
      context.disabled
    ) {
      return
    }

    change.object = object
    change.prop = prop
    change.closestEditable = closestEditable
    change.remainingPath = remainingPath

    // if the value that's set should be used to load an object and assign that to the prop, eg. textures, gltf models in r3f. It can be async.
    if (type.load) {
      let loadedValue = type.load(object, prop, input)

      if (loadedValue !== undefined && loadedValue.then) {
        loadedValue.then((resolvedValue: any) => {
          if (resolvedValue !== undefined) {
            change.value = resolvedValue

            this.setPropValue(change)
          }
        })
      } else {
        change.value = loadedValue

        this.setPropValue(change)
      }
    } else {
      change.value = input
      this.setPropValue(change)
    }
  }

  /**
   * Primary prop change handler, called by whoever wants to change a prop,
   * and have it reflected in the React element, and the editor and,
   * persisted to the code base when saved
   * @param param0
   * @returns
   */
  setPropValue({
    object,
    type,
    prop,
    value,
    input,
    path,
    controlPath,
    onChange,
    closestEditable,
    remainingPath
  }: PropChange) {
    type.set(object, prop, value)

    onChange?.(value, controlPath)

    let serializale = type.serialize
      ? type.serialize(object, prop, input, value)
      : value

    // prop thats not serializable is not editable
    // since we cant do anything with the edited prop
    if (serializale !== undefined && closestEditable) {
      if (this === closestEditable) {
        let [...p] = path

        // handle the `args` prop by updating the args array
        if (p[0] === "args") {
          let prevArgs = this.currentProps.args ?? []
          let prevPropArgs = this.props.args ?? []

          let args = (prevArgs ?? prevPropArgs).map((a: any, i: number) => {
            if (i === Number(p[1])) {
              return serializale
            }
            return a
          })
          this.addChange(this, "args", args)
          this.changed = true
          this.setProp("args", args)
          return
        }

        // otherwise its a prop on the edited element itself
        this.addChange(this, p.join("-"), serializale)
        this.changed = true
        this.setProp(p.join("-"), value)
      } else {
        // its a prop on a child editable element
        this.addChange(closestEditable, remainingPath.join("-"), serializale)
        this.changed = true
      }
    }
  }

  delete() {
    this.refs.deleted = true
    this.render()
  }

  get deleted() {
    return this.refs.deleted
  }
  ref?: Ref
  childIds: string[] = []
  changes: Record<string, Record<string, any>> = {}
  props: any = {}
  forwardedRef: boolean = false
  dirty: any = false
  store: StoreType | null = createLevaStore()
  editor: Editor = {} as any
  object?: Object3D<Event>

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
    forceUpdate: null as Dispatch<SetStateAction<number>> | null,
    setMoreChildren: null as Dispatch<SetStateAction<any[]>> | null,
    deleted: false,
    key: 0
  }

  mounted: boolean = false

  remount() {
    this.refs.setKey?.((i) => i + 1)
  }

  render() {
    this.refs.forceUpdate?.((i) => i + 1)
  }

  args = []

  update(source: JSXSource, props: any) {
    this.source = source
    this.currentProps = { ...props }
    this.args = props.args?.length ? props.args : this.args

    if (this.store?.get("name") !== this.displayName) {
      this.store?.setValueAtPath("name", this.displayName, true)
    }
  }

  useRenderState(forwardRef?: any) {
    const [key, setSey] = useState(0)
    const [_, forceUpdate] = useState(0)
    const [mounted, setMounted] = useState(false)
    const [moreChildren, setMoreChildren] = useState<any>([])
    this.refs.setKey = setSey
    this.refs.forceUpdate = forceUpdate
    this.forwardedRef = forwardRef ? true : false
    this.refs.setMoreChildren = setMoreChildren
    this.refs.key = key
    this.mounted = mounted

    // useState so that this runs only once when the item is created
    useState(() => {
      this.store?.addData(
        {
          name: {
            value: this.displayName,
            type: LevaInputs.STRING,
            label: "name",
            render: () => false
          }
        } as any,
        false
      )
    })

    return {
      component: this.type,
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
      moreChildren,
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
    return typeof this.type === "string"
      ? this.type
      : this.source.elementName
      ? this.source.elementName
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

  get visible() {
    return this.ref?.visible ?? true
  }

  set visible(v: boolean) {
    if (this.ref) {
      this.ref.visible = v
    }
  }

  useVisible() {
    const [visible, setVisible] = useState(true)
    return [visible, setVisible] as const
  }

  useIsSelected() {
    return this.editor.useState((state) => state.context.selectedId === this.id)
  }

  useHelper(arg0: string, helper: any, ...args: any[]) {
    const isEditing = this.editor.useStates("editing")
    const [props] = this.editor.useSettings("helpers", {
      [arg0]: multiToggle({
        label: arg0,
        data: "selected",
        options: ["all", "selected", "none"]
      })
    }) as [any]

    const isSelected = this.useIsSelected()

    let ref = isEditing
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
      return !(data["save"] as any).settings.disabled
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

    console.debug(diffs)

    try {
      console.log(await this.editor.save(diffs))
      this.changes = {}
      this.changed = false
    } catch (e) {
      toast.error("Error saving: " + e.message)
      console.error(e)
    }

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
        let edit = this.editor.findEditableElement(el)
        if (edit) {
          editable = edit
          remainingPath = path.slice(i + 1)
        }
      }
    }
    return [el, editable, remainingPath]
  }
}

import { createContext, useContext } from "react"
import { PropChange } from "../fiber/prop-types/core/types"

export const EditableElementContext = createContext<EditableElement | null>(
  null
)

export function useEditableContext() {
  const editableElement = useContext(EditableElementContext)
  if (!editableElement) {
    throw new Error("useEditableContext must be used within an EditableElement")
  }
  return editableElement
}
