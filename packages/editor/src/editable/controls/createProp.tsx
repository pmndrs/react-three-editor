import { PropInput } from "../../fiber/controls/prop"
import { EditableElement } from "../EditableElement"

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
    element = {} as EditableElement,
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

          let val = type.set(el, prop, value)

          if (val !== undefined && val.then) {
            val.then((setValue) => {
              onChange?.(value, prop, controlPath, context)

              let serializale = type.serialize
                ? type.serialize(el, prop, value)
                : value

              if (
                serializale !== undefined &&
                element instanceof EditableElement
              ) {
                if (editable) {
                  if (element === editable) {
                    let [_, ...p] = path
                    element.addChange(element, p.join("-"), serializale)
                    element.changed = true
                    let propOveride = setValue

                    if (propOveride !== undefined) {
                      element.setProp(p.join("-"), propOveride)
                    }
                  } else {
                    element.addChange(
                      editable,
                      remaining.join("-"),
                      serializale
                    )
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
            })
            return
          }

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
