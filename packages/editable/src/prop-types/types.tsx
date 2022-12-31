import { Editable } from "../Editable"
import { PropType } from "./createProp"

export interface PropInput {
  path: string[]
  element: Editable

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
  closestEditable?: Editable
  value: any
  remainingPath: string[]
}
