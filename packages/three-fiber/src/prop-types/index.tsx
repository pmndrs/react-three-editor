import { createPropTypes } from "@editable-jsx/editable"
import { camera } from "./camera"
import { material } from "./materials"
import { mesh } from "./mesh"
import * as types from "./primitives/types"
import { texture } from "./texture"
import { transform } from "./transform"

export const all = createPropTypes({
  ...types,
  material,
  texture,
  mesh,
  transform,
  camera
})
