import { Schema } from "leva/plugin"
import { MeshPhysicalMaterial } from "three"
import { EditableElement } from "../../../editable/EditableElement"
import { prop } from "../../controls/prop"
import { commonControls } from "./common"
import { createTextureFolder } from "./utils"

export const meshPhysicalMaterial = (
  element: EditableElement,
  path: string[] = ["ref"]
): Schema => {
  return {
    ...commonControls(element, path),
    color: prop.color({
      element,
      path: [...path, "color"]
    }),
    attenuationColor: prop.color({
      element,
      path: [...path, "attenuationColor"]
    }),
    attenuationDistance: prop.number({
      element,
      path: [...path, "attenuationDistance"]
    }),
    clearCoat: prop.number({
      element,
      path: [...path, "clearCoat"]
    }),
    flatShading: prop.bool({
      element,
      path: [...path, "flatShading"],
      onChange: (value) => {
        element.getObjectByPath<MeshPhysicalMaterial>(path).needsUpdate = true
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
    ...createTextureFolder(element, "clearCoat", path),
    ...createTextureFolder(element, "clearCoatNormal", path),
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
