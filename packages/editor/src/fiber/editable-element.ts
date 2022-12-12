import { TransformControls } from "three-stdlib"
import { StoreType } from "leva/dist/declarations/src/types"
import { EditorStoreType } from "./stores"
import { Group, MathUtils, Mesh, Object3D, PerspectiveCamera } from "three"
import { position } from "./position"

export enum ChangeSource {
  Leva = 0,
  TransformControls = 1,
  Prop = 2,
  Update = 3
}

export class EditableElement<P = {}> extends EventTarget {
  children: string[] = []
  props: any = {}
  render: () => void = () => {}
  ref: Object3D | PerspectiveCamera | Mesh | Group | null = null
  dirty: any = false

  store: StoreType | null = null

  transformControls$?: TransformControls
  useEditorStore: EditorStoreType = {} as any
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
    public type: keyof JSX.IntrinsicElements | React.FC<P>,
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

  get changed() {
    return this.store?.getData()["save"].settings.changed
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

  get position() {
    return this.ref?.position.toArray()
  }

  properties: Record<string, { set: any; get(): any }> = {
    position
  }

  // set position(value) {
  //   console.log("setting", value)
  //   this.dirty = true
  //   this.ref.position.set(...value)
  //   this.store?.setValueAtPath("transform.position", value, false)
  //   this.store?.setSettingsAtPath("save", { disabled: false })
  // }

  get rotation() {
    return [
      MathUtils.radToDeg(this.ref?.rotation.x),
      MathUtils.radToDeg(this.ref?.rotation.y),
      MathUtils.radToDeg(this.ref?.rotation.z)
    ]
  }

  setProp(prop: string, value: any, from: ChangeSource) {
    this.properties[prop]?.set(this, value, from)
  }

  getProp(prop: string, withDefault?: any) {
    return this.properties[prop]?.get(this, withDefault)
  }

  get scale() {
    return this.ref?.scale.toArray()
  }

  setLevaControls(controls: any) {
    if (!this.store) {
      return
    }
    let state = this.store.useStore.getState()
    let newControls = {} as any
    for (let key in controls) {
      let id = `${key}`
      newControls[id] = {
        ...state.data[id],
        ...controls[key]
      }
    }

    this.store.useStore.setState({
      data: {
        ...state.data,
        ...newControls
      }
    })
  }
}
