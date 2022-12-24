import { folder } from "leva"
import { BufferGeometry, Material, Mesh } from "three"
import { all } from "."
import { PropInput } from "./core/types"
import { geometry } from "./geometries"
import { primitives } from "./primitives"

export const mesh = (input: PropInput) => {
  return folder(meshControls(input))
}

export const meshControls = ({ element, path = ["ref"] }: PropInput) => {
  let controls: Record<string, any> = {
    castShadow: primitives.bool({
      element,
      path: [...path, "castShadow"]
    }),
    receiveShadow: primitives.bool({
      element,
      path: [...path, "receiveShadow"]
    })
  }

  let elementMesh = element?.getObjectByPath<Mesh>(path)
  if (
    element &&
    elementMesh &&
    elementMesh.geometry instanceof BufferGeometry
  ) {
    controls["geometry"] = geometry({
      element,
      path: [...path, "geometry"]
    })
  }
  if (element && elementMesh && elementMesh.material instanceof Material) {
    controls["material"] = all.material({
      element,
      path: [...path, "material"]
    })
  }

  return controls
}
