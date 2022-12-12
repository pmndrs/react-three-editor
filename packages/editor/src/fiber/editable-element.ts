import { OrbitControls, TransformControls } from "three-stdlib"
import { StoreType } from "leva/dist/declarations/src/types"
import { EditorStoreType } from "./stores"
import {
  DirectionalLight,
  Group,
  Material,
  MathUtils,
  Mesh,
  Object3D,
  PerspectiveCamera
} from "three"
import { defineProp, position, rotation, scale } from "./position"
import { folder, LevaInputs } from "leva"
import { applyProps } from "@react-three/fiber"
import { ref } from "./EntityEditor"
import { editable } from "."

export enum ChangeSource {
  Leva = 0,
  TransformControls = 1,
  Prop = 2,
  Update = 3
}

function isEditableElement(obj: any): EditableElement {
  return obj?.__r3f?.editable
}

function prop({
  entity,
  path,
  type,
  ...settings
}: {
  path: string[]
  entity: EditableElement
  type: {
    get: (obj: any, prop: string) => any
    set: (obj: any, prop: string, value: any) => void
    control?: any
  }

  step?: number
  min?: number
  max?: number
  options?: string[]
  lock?: boolean
}) {
  let el = entity.ref
  let editable = entity
  if (path.length > 0) {
    for (let i = 0; i < path.length - 1; i++) {
      el = el?.[path[i]]
    }
    editable = isEditableElement(el)
  }
  let prop = path[path.length - 1]
  return type.control
    ? type.control({
        value: type.get(el, prop)
      })
    : {
        value: type.get(el, prop),
        onChange(value: any, _: string, context: any) {
          if (!value || !context.fromPanel || context.initial) {
            return
          }

          type.set(el, prop, value)

          if (editable) {
            entity.addChange(editable, prop, value)
            entity.changed = true
          } else {
            entity.dirtyProp(path.join("-"), value)
          }
        },
        ...settings
      }
}

class EditableScene {
  elements: Record<string, EditableElement> = {}
  static Plugins = [
    {
      applicable: (entity: EditableElement) => entity.ref instanceof Object3D,
      controls: (entity: EditableElement) => {
        return {
          transform: folder(
            {
              position: {
                lock: true,
                step: 0.1,
                value: entity.getProp("position", true),
                onChange: (value, path, context) => {
                  if (value === null || !context.fromPanel || context.initial) {
                    return
                  }
                  entity.setProp("position", value, ChangeSource.Leva)
                }
              },
              rotation: {
                lock: true,
                step: 1,
                value: entity.getProp("rotation", true),
                onChange: (value, path, context) => {
                  if (value === null || !context.fromPanel || context.initial) {
                    return
                  }
                  entity.setProp("rotation", value, ChangeSource.Leva)
                }
              },
              scale: {
                lock: true,
                step: 0.1,
                type: LevaInputs.VECTOR3D,
                value: entity.getProp("scale", true),
                onChange: (value, path, context) => {
                  if (entity && typeof entity.currentProps.scale === "number") {
                    entity.store?.setSettingsAtPath(path, {
                      locked: true
                    })
                  }
                  if (value === null || !context.fromPanel || context.initial) {
                    return
                  }
                  entity.setProp("scale", value, ChangeSource.Leva)
                }
              }
            },
            {
              collapsed: false
            }
          )
        }
      }
    },
    {
      applicable: (entity: EditableElement) =>
        entity.ref instanceof Mesh && entity.ref.material,
      controls: (entity: EditableElement) => {
        return {
          material: folder({
            color: prop({
              entity,
              path: ["material", "color"],
              type: color
            }),

            wireframe: prop({
              entity,
              path: ["material", "wireframe"],
              type: bool
            })
          })
        }
      }
    },
    {
      applicable: (entity: EditableElement) =>
        entity.ref instanceof OrbitControls,
      controls: (entity: EditableElement) => {
        return {
          target: prop({
            entity,
            path: ["object"],
            type: {
              get(obj: any, prop: string) {
                return obj[prop]?.__r3f.editable
              },
              control: ref,
              set(obj: any, prop: string, value: any) {}
            }
          })
        }
      }
    },
    {
      applicable: (entity: EditableElement) =>
        entity.ref instanceof DirectionalLight,
      controls: (entity: EditableElement) => {
        return {
          color: prop({
            entity,
            path: ["color"],
            type: color
          }),
          intensity: prop({
            entity,
            step: 0.1,
            path: ["intensity"],
            type: number
          })
        }
      }
    }
  ]
  selected: EditableElement | null = null
}

export class EditableElement<
  Ref extends Object3D = Object3D
> extends EventTarget {
  children: string[] = []
  props: any = {}
  render: () => void = () => {}
  ref?: Object3D | Group | Mesh | Ref
  dirty: any = false

  store: StoreType | null = null

  transformControls$?: TransformControls
  useEditorStore: EditorStoreType = {} as any
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

  properties: Record<
    string,
    {
      set(el: EditableElement, value: any, from: ChangeSource): any
      get(el: EditableElement, withDefault: boolean): any
    }
  > = {
    position,
    rotation,
    scale,
    color: defineProp({
      get(el, withDefault) {
        return el.ref?.color.getStyle()
      },
      set(el, value, from) {
        if (!(el.ref instanceof Mesh)) {
          throw new Error("Cannot set color on non-mesh")
        }
      }
    }),
    "material-color": defineProp({
      get(el, withDefault) {
        if (!(el.ref instanceof Mesh)) {
          throw new Error("Cannot set color on non-mesh")
        }
        return el.ref?.material?.color.getStyle()
      },
      set(el, value, from) {
        if (!(el.ref instanceof Mesh)) {
          throw new Error("Cannot set color on non-mesh")
        }

        el.ref.material.color.setStyle(value)
        let editable = isEditableElement(el.ref?.material)
        if (editable) {
          el.addChange(editable, "color", value)
          el.changed = true
        } else {
          el.dirtyProp("material-color", value)
        }
      }
    }),
    "material-wireframe": defineProp({
      get(el, withDefault) {
        if (!(el.ref instanceof Mesh)) {
          throw new Error("Cannot set color on non-mesh")
        }
        return el.ref?.material?.wireframe
      },
      set(el, value, from) {
        if (!(el.ref instanceof Mesh)) {
          throw new Error("Cannot set color on non-mesh")
        }
        el.ref.material.wireframe = value
        let editable = isEditableElement(el.ref?.material)
        if (editable) {
          el.addChange(editable, "wireframe", value)
          el.changed = true
        } else {
          el.dirtyProp("material-wireframe", value)
        }
      }
    })
  }

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
    EditableScene.Plugins.forEach((plugin) => {
      if (plugin.applicable(entity)) {
        Object.assign(controls, plugin.controls(entity))
      }
    })

    // if (entity.ref instanceof Material) {
    //   Object.assign(controls, {
    //     material: folder({
    //       wireframe: {
    //         value: entity.ref.wireframe,
    //         onChange(v) {
    //           entity.ref.wireframe = v
    //           // entity.render()
    //         }
    //       },
    //       color: {
    //         value: entity.ref.color.getStyle(),
    //         onChange(v) {
    //           entity.ref.color.setStyle(v)
    //           // entity.render()
    //         }
    //       }
    //     })
    //   })
    // }

    return controls
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
}
const color = {
  get: (obj: any, prop: string) => {
    return obj[prop].getStyle()
  },
  set: (obj: any, prop: string, value: any) => {
    obj[prop].setStyle(value)
  }
}

const bool = {
  get: (obj: any, prop: string) => {
    return obj[prop]
  },
  set: (obj: any, prop: string, value: any) => {
    obj[prop] = value
  }
}

const number = {
  get: (obj: any, prop: string) => {
    return obj[prop]
  },
  set: (obj: any, prop: string, value: any) => {
    obj[prop] = value
  }
}
