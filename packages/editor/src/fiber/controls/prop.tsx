import { MathUtils, TextureLoader } from "three"
import { ref } from "../../editable/controls/ref"
import { EditableElement } from "../../editable/EditableElement"
import { texture } from "./texture"

export interface PropInput {
  path?: string[]
  element?: any

  step?: number
  min?: number
  max?: number
  options?: string[] | Record<any, any>
  lock?: boolean
  default?: any
  label?: string

  onChange?: (
    value: any,
    prop: string,
    controlPath: string,
    context: any
  ) => void
  render?(get: (prop: string) => any): boolean
}

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
    override?: (obj: any, prop: string, value: any) => any
  },
  {
    element = {} as any,
    path = [],
    persist,
    onChange,
    ...settings
  }: PropInput & {
    step?: number
    min?: number
    max?: number
    options?: string[] | Record<any, any>
    lock?: boolean
    default?: any
    persist?: boolean
  }
) {
  const el = element.getObjectByPath(path.slice(0, path.length - 1))

  let prop = path[path.length - 1]

  let initialValue = el
    ? type.get(el, prop) ?? settings.default
    : settings.default
  return type.control
    ? type.control({
        value: initialValue,
        onChange(value: any, controlPath: string, context: any) {
          const [el, editable, remaining] =
            element.getEditableObjectByPath(path)

          if (value !== null && context.initial) {
            if (persist) {
            }
            type.init?.(el, prop, value)
          }
          if (
            value === null ||
            !context.fromPanel ||
            context.initial ||
            context.disabled
          ) {
            return
          }

          type.set(el, prop, value)
          onChange?.(value, prop, controlPath, context)

          let serializale = type.serialize
            ? type.serialize(el, prop, value)
            : value

          if (serializale !== undefined && element instanceof EditableElement) {
            if (editable) {
              if (element === editable) {
                let [_, ...p] = path
                element.addChange(element, p.join("-"), serializale)
                element.changed = true
                let propOveride = type.override
                  ? type.override(el, prop, serializale)
                  : serializale

                if (propOveride !== undefined) {
                  element.setProp(p.join("-"), propOveride)
                }
              } else {
                element.addChange(editable, remaining.join("-"), serializale)
                element.changed = true
              }
            } else {
              let [_, ...p] = path
              element.addChange(element, p.join("-"), serializale)
              element.changed = true

              let propOveride = type.override
                ? type.override(el, prop, serializale)
                : serializale

              if (propOveride !== undefined) {
                element.setProp(p.join("-"), propOveride)
              }
            }
          }
        },
        ...settings
      })
    : {
        value: initialValue,
        onChange(value: any, controlPath: string, context: any) {
          const [el, editable, remaining] =
            element.getEditableObjectByPath(path)

          if (value !== null && context.initial) {
            type.init?.(el, prop, value)
          }
          if (
            value === null ||
            !context.fromPanel ||
            context.initial ||
            context.disabled
          ) {
            return
          }

          // Sets the value on the object described by the path
          type.set(el, prop, value)

          onChange?.(value, prop, controlPath, context)

          let serializale = type.serialize
            ? type.serialize(el, prop, value)
            : value

          // prop thats not serializable is not editable
          // since we cant do anything with the edited prop
          if (serializale !== undefined && editable) {
            // if the root element is the closest editable element
            if (element === editable) {
              let [_, ...p] = path

              // handle the `args` prop by updating the args array
              if (p[0] === "args") {
                let prevArgs = element.currentProps.args ?? []
                let prevPropArgs = element.props.args ?? []

                let args = (prevArgs ?? prevPropArgs).map(
                  (a: any, i: number) => {
                    if (i === Number(p[1])) {
                      return serializale
                    }
                    return a
                  }
                )
                element.setProp("args", args)
                return
              }

              // record a change in the log to be persisted
              element.addChange(element, p.join("-"), serializale)
              element.changed = true

              let propOveride = type.override
                ? type.override(el, prop, serializale)
                : serializale

              // if the prop is serializable, and overridable, we can set the prop
              // on the component and rerender it
              if (propOveride !== undefined) {
                element.setProp(p.join("-"), propOveride)
              }
            } else {
              // if a child editable element is the closest editable element and modified,
              // record the change in the log, and we mark ourselves as dirty
              // (maybe we should mark the child as dirty too)
              // the property has been set by us above
              element.addChange(editable, remaining.join("-"), serializale)
              element.changed = true
            }
          }
        },
        ...settings
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

const colorstring = {
  get: (obj: any, prop: string) => {
    return obj[prop]
  },
  set: (obj: any, prop: string, value: any) => {
    obj[prop] = value
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

const vector2d = {
  get: (obj: any, prop: string): [number, number] => {
    return obj?.[prop]?.toArray()
  },
  set: (obj: any, prop: string, value: [number, number]) => {
    obj[prop].fromArray(value)
  },
  serialize: (obj: any, prop: string, value: [number, number]) => {
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
  },
  serialize: (obj: any, prop: string, value: any) => {
    return Number(value.toFixed(3))
  }
}

const textureT: {
  get: (obj: any, prop: string) => any
  set: (obj: any, prop: string, value: any) => void
  control?: any
  init?: ((obj: any, prop: string, value: any) => void) | undefined
  serialize(obj: any, prop: string, value: any): any
} = {
  control: texture,
  get(obj: any, prop: string) {
    return obj[prop]?.source?.data?.src
  },
  set(obj: any, prop: string, value: any) {
    obj[prop] = new TextureLoader().load(value)
    obj.needsUpdate = true
  },
  serialize(obj: any, prop: string, value: any) {
    return {
      src: value,
      loader: "TextureLoader",
      expression: `useLoader(TextureLoader, '${value}')`,
      imports: [
        {
          import: ["useLoader"],
          importPath: "@react-three/fiber"
        },
        {
          import: ["TextureLoader"],
          importPath: "three"
        }
      ]
    }
  },
  override(obj: any, prop: string, value: any) {
    return undefined
  }
}

const select = {
  get(obj: any, prop: string) {
    return obj?.[prop]
  },
  set(obj: any, prop: string, value: any) {
    obj[prop]
  },
  serialize(obj: any, prop: string, value: any) {
    return value
  }
}

export const prop = Object.assign(createProp, {
  color: (props: PropInput) => createProp(color, props),
  colorstring: (props: PropInput) => createProp(colorstring, props),
  number: (props: PropInput) => createProp(number, props),
  texture: (props: PropInput) => createProp(textureT, props),
  bool: (props: PropInput) => createProp(bool, props),
  vector3d: (props: PropInput) => createProp(vector3d, props),
  vector2d: (props: PropInput) => createProp(vector2d, props),
  euler: (props: PropInput) => createProp(euler, props),
  ref: (props: PropInput) =>
    createProp(
      {
        get(obj: any, prop: string) {
          return getEditableElement(obj[prop])
        },
        control: ref,
        set(obj: any, prop: string, value: any) {}
      },
      props
    ),
  select: (props: PropInput) => createProp(select, props),
  unknown: (props: PropInput) =>
    createProp(
      {
        get(obj: any, prop: string) {
          return obj?.[prop]
        },
        set(obj: any, prop: string, value: any) {
          obj[prop]
        },
        serialize(obj: any, prop: string, value: any) {
          return value
        }
      },
      props
    )
})
