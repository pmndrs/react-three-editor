import { EditableElement } from "./EditableElement"

export type PropType = {
  get: (obj: any, prop: string) => any
  set: (obj: any, prop: string, value: any) => void
  control?: any
  load?: (obj: any, prop: string, value: any) => Promise<any> | any
  init?: (obj: any, prop: string, value: any) => void
  serialize?: (obj: any, prop: string, input: any, value: any) => any
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
        onChange: handleChange,
        ...settings
      }
}

export interface PropInput {
  path: string[]
  element: EditableElement

  step?: number
  min?: number
  max?: number
  options?: string[] | Record<any, any>
  lock?: boolean
  default?: any
  label?: string
  collapsed?: boolean

  onChange?: (value: any, controlPath: string) => void
  render?(get: (prop: string) => any): boolean
}

export type PropChange = {
  controlPath: string
  input: any
  type: PropType
  path: string[]
  context: any
  onChange?: (value: any, controlPath: string) => void

  object: any
  prop: string
  closestEditable?: EditableElement
  value: any
  remainingPath: string[]
}

type PropTypes<K> = {
  [k in keyof K]: (props: PropInput) => any
}

export let createPropTypes = function <K extends object>(
  types: K
): PropTypes<K> {
  return Object.fromEntries(
    Object.entries(types).map(([k, v]) => [
      k,
      (props: PropInput) => createProp(v, props)
    ])
  ) as any
}
