import { EditableElement } from "../../../editable"

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

  onChange?: (
    value: any,
    prop: string,
    controlPath: string,
    context: any
  ) => void
  render?(get: (prop: string) => any): boolean
}
