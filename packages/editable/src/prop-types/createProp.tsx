import { EditableElement } from "../editable/EditableElement"
import { PropChange, PropInput } from "./types"

export type PropType = {
  get: (obj: any, prop: string) => any
  set: (obj: any, prop: string, value: any) => void
  control?: any
  load?: (obj: any, prop: string, value: any) => Promise<any> | any
  init?: (obj: any, prop: string, value: any) => void
  serialize?: (obj: any, prop: string, input: any, value: any) => any
  override?: (obj: any, prop: string, value: any) => any
}

export function createProp(
  type: PropType | ((props: PropInput) => any),
  {
    element = {} as EditableElement,
    path = [],
    onChange,
    ...settings
  }: PropInput & {
    step?: number
    min?: number
    max?: number
    options?: string[] | Record<any, any>
    lock?: boolean
    default?: any
  }
) {
  if (typeof type === "function") {
    return type({
      element,
      path,
      onChange,
      ...settings
    })
  }

  const el = element.getObjectByPath(path.slice(0, path.length - 1))

  let prop = path[path.length - 1]

  let initialValue = el
    ? type.get(el, prop) ?? settings.default
    : settings.default

  let handleChange = (value: any, controlPath: string, context: any) => {
    element.handlePropChange({
      path,
      input: value,
      controlPath,
      context,
      onChange,
      type
    } as PropChange)
  }

  return type.control
    ? type.control({
        value: initialValue,
        onChange: handleChange,
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

          if (el) {
            // Sets the value on the object described by the path
            type.set(el, prop, value)
          }

          let done = onChange?.(value, controlPath)
          if (done) {
            return true
          }

          let serializale = type.serialize
            ? type.serialize(el, prop, value)
            : value

          // prop thats not serializable is not editable
          // since we cant do anything with the edited prop
          if (serializale !== undefined && editable) {
            // if the root element is the closest editable element
            if (element === editable) {
              // handle the `args` prop by updating the args array,
              // we can only update the args array on the top level element of the change
              if (path[0] === "args") {
                let prevArgs = element.args ?? []
                let prevPropArgs = element.props.args ?? []

                let args = (prevArgs ?? prevPropArgs).map(
                  (a: any, i: number) => {
                    if (i === Number(path[1])) {
                      return serializale
                    }
                    return a
                  }
                )
                element.addChange(element, "args", args)
                element.changed = true
                element.setProp("args", args)
                return
              }

              let [_, ...p] = path

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
