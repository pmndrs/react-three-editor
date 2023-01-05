import { PropInput } from "@editable-jsx/editable"
import { folder } from "leva"
import { BufferGeometry, Material, Mesh } from "three"
import { all, getEditableElement } from "."
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
    let el = getEditableElement(elementMesh.geometry)
    if (el) {
      controls["geometry"] = geometry({
        element: el,
        path: ["ref"]
      })
    }
  }
  if (element && elementMesh && elementMesh.material instanceof Material) {
    controls["material"] = all.material({
      element,
      path: [...path, "material"]
    })
  }

  return controls
}
