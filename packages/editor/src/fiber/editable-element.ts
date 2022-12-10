import { TransformControls } from "three-stdlib"
import { Schema, StoreType } from "leva/dist/declarations/src/types"
import { eq } from "./eq"
import { EditorStoreType } from "./stores"
import { MathUtils, Object3D } from "three"
import { levaStore } from "leva"

export class EditableElement<P = {}> extends EventTarget {
  children: string[] = []
  props: any = {}
  ref: any | null = null
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
      return `${this.source.componentName}:${
        typeof this.type === "string"
          ? this.type
          : this.type.displayName || this.type.name
      }:${this.source.lineNumber}:${this.source.columnNumber}`
    }
    return `${this.source.moduleName}:${this.source.componentName}:${
      typeof this.type === "string"
        ? this.type
        : this.type.displayName || this.type.name
    }:${this.source.lineNumber}:${this.source.columnNumber}`
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

  setProp(prop: string, value: any) {
    // this.props[prop] = value
  }

  setTransformFromControls(object: Object3D) {
    this.ref.rotation.copy(object.rotation)
    this.ref.scale.copy(object.scale)
    this.position = object.position.toArray()
    this.setLevaControls({
      "transform.rotation": {
        value: this.rotation
      },
      "transform.scale": {
        value: this.scale
      }
    })
  }

  show() {
    levaStore.setSettingsAtPath(this.name, {
      collapsed: false
    })
  }

  hide() {
    levaStore.setSettingsAtPath(this.name, {
      collapsed: true
    })
  }

  setPositionFromPanel(position: [number, number, number]) {
    this.ref.position.set(...position)
    this.dirty = true
  }

  get position() {
    return this.ref?.position.toArray()
  }

  set position(value) {
    console.log("setting", value)

    // levaStore?.setSettingsAtPath(`scene.` + this.name, {
    //   dirty: true
    // })
    this.dirty = true
    this.ref.position.set(...value)
    this.store?.setValueAtPath("transform.position", value, false)
    this.store?.setSettingsAtPath("save", { disabled: false })
  }

  get rotation() {
    return [
      MathUtils.radToDeg(this.ref.rotation.x),
      MathUtils.radToDeg(this.ref.rotation.y),
      MathUtils.radToDeg(this.ref.rotation.z)
    ]
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
