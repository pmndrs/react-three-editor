import { MathUtils, TextureLoader } from "three"
import { ref } from "../../editable/controls/ref"
import { EditableElement } from "../../editable/EditableElement"
import { texture } from "./texture"

export function getEditableElement(obj: any): EditableElement {
  return obj?.__r3f?.editable
}
export function createProp(
  type: {
    get: (obj: any, prop: string) => any
    set: (obj: any, prop: string, value: any) => void
    control?: any
    init?: (obj: any, prop: string, value: any) => void
    serialize?: (obj: any, prop: string, value: any) => any
  },
  {
    element,
    path,
    ...settings
  }: PropInput & {
    step?: number
    min?: number
    max?: number
    options?: string[]
    lock?: boolean
  }
) {
  let el = element
  let editable = element
  if (path.length > 0) {
    for (let i = 0; i < path.length - 1; i++) {
      el = el?.[path[i]]
    }
    editable = getEditableElement(el)
  }
  let prop = path[path.length - 1]
  return type.control
    ? type.control({
        value: type.get(el, prop),
        onChange(value: any, _: string, context: any) {
          if (value !== null && context.initial) {
            type.init?.(el, prop, value)
          }
          if (value === null || !context.fromPanel || context.initial) {
            return
          }

          type.set(el, prop, value)

          if (editable) {
            element.addChange(editable, prop, value)
            element.changed = true
          } else {
            element.dirtyProp(path.join("-"), value)
          }
        }
      })
    : {
        value: type.get(el, prop),
        onChange(value: any, _: string, context: any) {
          if (value !== null && context.initial) {
            type.init?.(el, prop, value)
          }
          if (value === null || !context.fromPanel || context.initial) {
            return
          }

          type.set(el, prop, value)

          let serializale = type.serialize
            ? type.serialize(el, prop, value)
            : value

          if (editable) {
            element.addChange(editable, prop, serializale)
            element.changed = true
          } else {
            element.dirtyProp(path.join("-"), serializale)
          }
        },
        ...settings
      }
}

export interface PropInput {
  path: string[]
  element: any

  step?: number
  min?: number
  max?: number
  options?: string[]
  lock?: boolean
}

const color = {
  get: (obj: any, prop: string) => {
    return obj[prop].getStyle()
  },
  set: (obj: any, prop: string, value: any) => {
    obj[prop].setStyle(value)
  }
}
const vector3d = {
  get: (obj: any, prop: string) => {
    return obj[prop].toArray()
  },
  set: (obj: any, prop: string, value: any) => {
    obj[prop].fromArray(value)
  },
  serialize: (obj: any, prop: string, value: [number, number, number]) => {
    return value?.map((v) => Number(v.toFixed(3)))
  }
}
const euler = {
  get: (obj: any, prop: string) => {
    return [
      MathUtils.radToDeg(obj[prop].x),
      MathUtils.radToDeg(obj[prop].y),
      MathUtils.radToDeg(obj[prop].z)
    ]
  },
  set: (obj: any, prop: string, value: [number, number, number]) => {
    let radians = value.map((v) => MathUtils.degToRad(v))
    let v = [...radians, "XYZ"]
    obj[prop].fromArray(v)
  },
  serialize: (obj: any, prop: string, value: [number, number, number]) => {
    return value?.map((v) => Number(MathUtils.degToRad(v).toFixed(3)))
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

const textureT: {
  get: (obj: any, prop: string) => any
  set: (obj: any, prop: string, value: any) => void
  control?: any
  init?: ((obj: any, prop: string, value: any) => void) | undefined
} = {
  control: texture,
  get(obj: any, prop: string) {
    return obj[prop]?.source.data.src
  },
  set(obj: any, prop: string, value: any) {
    console.log("set", obj, prop, value)
    obj[prop] = new TextureLoader().load(value)
  }
}

export const prop = Object.assign(createProp, {
  color: (props: PropInput) => createProp(color, props),
  number: (props: PropInput) => createProp(number, props),
  texture: (props: PropInput) => createProp(textureT, props),
  bool: (props: PropInput) => createProp(bool, props),
  vector3d: (props: PropInput) => createProp(vector3d, props),
  euler: (props: PropInput) => createProp(euler, props),
  ref: (props: PropInput) =>
    createProp(
      {
        get(obj: any, prop: string) {
          return obj[prop]?.__r3f.editable
        },
        control: ref,
        set(obj: any, prop: string, value: any) {}
      },
      props
    )
})
