import { StoreType } from "leva/dist/declarations/src/types"
import { Event, Object3D } from "three"
import { getEditableElement } from "../fiber/controls/prop"
import { ThreeEditor } from "../fiber/ThreeEditor"

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
    return this.ref?.name?.length && this.ref.name !== this.key
      ? this.ref.name
      : `${this.source.componentName}.${this.elementName}`
  }

  set name(v: string) {
    if (this.ref) {
      this.ref.name = v
    }
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
    this.store?.setSettingsAtPath("save", {
      disabled: !value
    })
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
