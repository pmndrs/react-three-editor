import { EditableElement } from "../../../editable/EditableElement"
import { PropInput } from "./types"

export type PropType = {
  get: (obj: any, prop: string) => any
  set: (obj: any, prop: string, value: any) => void
  control?: any
  load?: (obj: any, prop: string, value: any) => Promise<any> | any
  init?: (obj: any, prop: string, value: any) => void
  serialize?: (obj: any, prop: string, value: any) => any
  override?: (obj: any, prop: string, value: any) => any
}

function handlePropChange(
  editableElement: EditableElement<any>,
  path: string[],
  value: any,
  type: PropType,
  {
    controlPath,
    context,
    persist,
    onChange
  }: { context: any; persist: any; onChange: any }
) {
  // using the path, figure out the object that needs to be edited, the
  // closest editable JSX element, and the path from the closest editable
  // JSX element to the prop that needs to be edited
  const [object, closestEditable, remaining] =
    editableElement.getEditableObjectByPath(path)

  // the last item in the path is the prop that needs to be edited
  const prop = path[path.length - 1]

  // if the type has an init function, call it with the object, prop, and value, useful to some side effect on initialization from the control representation of the prop,
  // this should be used sparingly, and the `get` function should be used to change the data representation of the prop to the control representation
  if (value !== null && type.init && context.initial) {
    type.init?.(object, prop, value)
  }

  if (
    value === null ||
    !context.fromPanel ||
    context.initial ||
    context.disabled
  ) {
    return
  }

  // if the value that's set should be used to load an object and assign that to the prop, eg. textures, gltf models in r3f. It can be async.
  if (type.load) {
    let loadedValue = type.load(object, prop, value)
    if (loadedValue !== undefined && loadedValue.then) {
      loadedValue.then((resolvedValue) => {
        editableElement.setPropValue({
          object,
          prop,
          type,
          input: value,
          value: resolvedValue,
          controlPath,
          onChange,
          closestEditable,
          path
        })
      })
    } else {
      editableElement.setPropValue({
        object,
        prop,
        type,
        input: value,
        value: loadedValue,
        controlPath,
        onChange,
        closestEditable,
        path
      })
    }
  } else {
    editableElement.setPropValue({
      object,
      prop,
      type,
      input: value,
      value,
      controlPath,
      onChange,
      closestEditable,
      path
    })
  }
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

  return type.control
    ? type.control({
        value: initialValue,
        onChange: null,

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
                element.addChange(element, "args", args)
                element.changed = true
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

// onChange(value: any, controlPath: string, context: any) {
//   const [el, editable, remaining] =
//     element.getEditableObjectByPath(path)

//   if (value !== null && context.initial) {
//     if (persist) {
//     }
//     type.init?.(el, prop, value)
//   }
//   if (
//     value === null ||
//     !context.fromPanel ||
//     context.initial ||
//     context.disabled
//   ) {
//     return
//   }

//   let val = type.set(el, prop, value)

//   if (val !== undefined && val.then) {
//     val.then((setValue) => {
//       onChange?.(value, prop, controlPath, context)

//       let serializale = type.serialize
//         ? type.serialize(el, prop, value)
//         : value

//       if (
//         serializale !== undefined &&
//         element instanceof EditableElement
//       ) {
//         if (editable) {
//           if (element === editable) {
//             let [_, ...p] = path
//             element.addChange(element, p.join("-"), serializale)
//             element.changed = true
//             let propOveride = setValue

//             if (propOveride !== undefined) {
//               element.setProp(p.join("-"), propOveride)
//             }
//           } else {
//             element.addChange(
//               editable,
//               remaining.join("-"),
//               serializale
//             )
//             element.changed = true
//           }
//         } else {
//           let [_, ...p] = path
//           element.addChange(element, p.join("-"), serializale)
//           element.changed = true

//           let propOveride = type.override
//             ? type.override(el, prop, serializale)
//             : serializale

//           if (propOveride !== undefined) {
//             element.setProp(p.join("-"), propOveride)
//           }
//         }
//       }
//     })
//     return
//   }

//   onChange?.(value, prop, controlPath, context)

//   let serializale = type.serialize
//     ? type.serialize(el, prop, value)
//     : value

//   if (serializale !== undefined && element instanceof EditableElement) {
//     if (editable) {
//       if (element === editable) {
//         let [_, ...p] = path
//         element.addChange(element, p.join("-"), serializale)
//         element.changed = true
//         let propOveride = type.override
//           ? type.override(el, prop, serializale)
//           : serializale

//         if (propOveride !== undefined) {
//           element.setProp(p.join("-"), propOveride)
//         }
//       } else {
//         element.addChange(editable, remaining.join("-"), serializale)
//         element.changed = true
//       }
//     } else {
//       let [_, ...p] = path
//       element.addChange(element, p.join("-"), serializale)
//       element.changed = true

//       let propOveride = type.override
//         ? type.override(el, prop, serializale)
//         : serializale

//       if (propOveride !== undefined) {
//         element.setProp(p.join("-"), propOveride)
//       }
//     }
//   }
// },
