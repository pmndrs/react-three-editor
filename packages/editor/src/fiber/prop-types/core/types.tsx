import { EditableElement } from "../../../editable"
import { PropType } from "./createProp"

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
