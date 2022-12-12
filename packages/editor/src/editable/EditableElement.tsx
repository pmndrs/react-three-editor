import { StoreType } from "leva/dist/declarations/src/types"
import { Group, Mesh, Object3D } from "three"
import React from "react"
import { Editor } from "./Editor"

export function getEditableElement(obj: any): EditableElement {
  return obj?.__r3f?.editable
}

export class EditableElement<
  Ref extends Object3D = Object3D
> extends EventTarget {
  async save(client: { save: (data: any) => Promise<void> }) {
    let diffs = Object.values(this.changes).map(({ _source, ...value }) => ({
      value,
      source: _source
    }))

    for (var diff of diffs) {
      await client.save(diff)
    }
    this.store?.setSettingsAtPath("save", { disabled: true })
  }
  children: string[] = []
  props: any = {}
  render: () => void = () => {}
  ref?: Object3D | Group | Mesh | Ref
  dirty: any = false

  store: StoreType | null = null

  editor: Editor = {} as any
  currentProps: any

  constructor(
    public id: string,
    public source: {
      fileName: string
      lineNumber: number
      columnNumber: number
      moduleName: string
      componentName: string
      elementName: string
    },
    public type: keyof JSX.IntrinsicElements | React.FC<any>,
    public parentId?: string | null
  ) {
    super()
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
      : `${this.source.componentName}:${this.elementName}`
  }

  set name(v: string) {
    if (this.ref) {
      this.ref.name = v
    }
  }

  changes: Record<string, Record<string, any>> = {}

  addChange(element: EditableElement, prop: string, value: any) {
    if (!this.changes[element.id]) {
      this.changes[element.id] = { _source: element.source }
    }
    this.changes[element.id][prop] = value
  }

  get changed() {
    return !this.store?.getData()["save"].settings.disabled
  }

  set changed(value) {
    this.store?.setSettingsAtPath("save", {
      disabled: !value
    })
  }

  dirtyProp(arg0: string, arg1: number[]) {
    this.store?.setSettingsAtPath("save", {
      disabled: false
    })

    this.addChange(this, arg0, arg1)

    if (this.props) {
      this.props[arg0] = arg1
      this.render()
    }
  }

  get controls() {
    let controls = {}
    let entity = this
    this.editor.plugins.forEach((plugin) => {
      if (plugin.applicable(entity)) {
        Object.assign(controls, plugin.controls(entity))
      }
    })

    return controls
  }
}
