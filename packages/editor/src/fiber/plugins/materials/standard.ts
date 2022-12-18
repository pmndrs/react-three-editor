import { Schema } from "leva/plugin"
import { MeshStandardMaterial } from "three"
import { EditableElement } from "../../../editable/EditableElement"
import { prop } from "../../controls/prop"
import { commonControls } from "./common"
import { createTextureFolder } from "./utils"

export const meshStandardMaterial = (
  element: EditableElement,
  path: string[] = ["ref"]
): Schema => {
  return {
    color: prop.color({
      element,
      path: [...path, "color"]
    }),
    flatShading: prop.bool({
      element,
      path: [...path, "flatShading"],
      onChange: (value) => {
        element.getObjectByPath<MeshStandardMaterial>(path).needsUpdate = true
      }
    }),
    fog: prop.bool({
      element,
      path: [...path, "fog"]
    }),
    wireframe: prop.bool({
      element,
      path: [...path, "wireframe"]
    }),
    ...commonControls(element, path),
    ...createTextureFolder(element, "map", path),
    ...createTextureFolder(element, "alpha", path),
    ...createTextureFolder(element, "ao", path),
    ...createTextureFolder(element, "bump", path),
    ...createTextureFolder(element, "displacement", path),
    ...createTextureFolder(element, "emissive", path, {
      emissiveColor: prop.color({
        element,
        path: [...path, "emissive"],
        label: "color"
      })
    }),
    ...createTextureFolder(element, "env", path),
    ...createTextureFolder(element, "light", path),
    ...createTextureFolder(element, "metalness", path, {
      metalnessValue: prop.number({
        element,
        path: [...path, "metalness"],
        label: "value",
        min: 0,
        max: 1,
        step: 0.1
      })
    }),
    ...createTextureFolder(element, "roughness", path, {
      roughnessValue: prop.number({
        element,
        path: [...path, "roughness"],
        label: "value",
        min: 0,
        max: 1,
        step: 0.1
      })
    }),
    ...createTextureFolder(element, "normal", path)
  }
}
