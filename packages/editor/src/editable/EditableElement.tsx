import { StoreType } from "leva/dist/declarations/src/types"
import { Editor } from "./Editor"

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
  forwardedRef: boolean = false
  children: string[] = []
  props: any = {}
  render: () => void = () => {}
  ref?: Ref
  dirty: any = false
  store: StoreType | null = null
  changes: Record<string, Record<string, any>> = {}
  editor: Editor = {} as any
  currentProps: any
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
    this.dispatchEvent(new CustomEvent("ref-changed", {}))
  }

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
      : `${this.elementName}`
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
    let data = this.store?.getData()
    console.log(data.save)
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

  dirtyProp(arg0: string, arg1: number[]) {
    this.store?.setSettingsAtPath("save", {
      disabled: false
    })

    this.addChange(this, arg0, arg1)

    if (!this.forwardedRef || this.type !== "string") {
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
}
