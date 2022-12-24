import { folder } from "leva"
import { BoxHelper, Material, Mesh } from "three"
import { EditableElement } from "../../editable/EditableElement"
import { prop, PropInput } from "../controls/prop"
import { materialControls } from "./materials"

export const meshControls = ({ element, path = ["ref"] }: PropInput) => {
  let controls: Record<string, any> = {
    castShadow: prop.bool({
      element,
      path: [...path, "castShadow"]
    }),
    receiveShadow: prop.bool({
      element,
      path: [...path, "receiveShadow"]
    })
  }

  let elementMesh = element?.getObjectByPath<Mesh>(path)

  if (element && elementMesh && elementMesh.material instanceof Material) {
    controls["material"] = folder(
      materialControls({
        element,
        path: [...path, "material"]
      })
    )
  }

  return controls
}

export const mesh = {
  applicable: (object: any) => object.ref?.isMesh,
  controls: (element: EditableElement) => {
    return meshControls({ element, path: ["ref"] })
  },
  helper: ({ element }: { element: EditableElement }) => {
    element.useHelper("mesh", BoxHelper)
    return null
  }
}
