import { createProps } from "./core/createProps"
import { material } from "./materials"
import { mesh } from "./mesh"
import * as types from "./primitive-types"
import { texture } from "./texture"

export function getEditableElement(obj: any): any {
  return obj?.__r3f?.editable
}

export const all = createProps({
  ...types,
  material,
  texture,
  mesh
})
