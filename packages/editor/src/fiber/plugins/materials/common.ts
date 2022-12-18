import { Material, FrontSide, BackSide, DoubleSide } from "three"
import { EditableElement } from "../../../editable/EditableElement"
import { prop } from "../../controls/prop"

export const commonControls = (
  element: EditableElement,
  path: string[] = ["ref"]
) => {
  return {
    transparent: prop.bool({
      element,
      path: [...path, "transparent"],
      onChange: (value) => {
        const object = element.getObjectByPath<Material>(path)
        object.needsUpdate = true
      }
    }),
    opacity: prop.bool({
      element,
      path: [...path, "opacity"],
      min: 0,
      max: 1,
      step: 0.1
    }),
    toneMapped: prop.bool({
      element,
      path: [...path, "tonemapped"]
    }),
    side: prop.select({
      element,
      path: [...path, "side"],
      options: {
        FrontSide,
        BackSide,
        DoubleSide
      }
    }),
    shadowSide: prop.select({
      element,
      path: [...path, "shadowSide"],
      default: "null",
      options: {
        FrontSide,
        BackSide,
        DoubleSide
      }
    }),
    precision: prop.select({
      element,
      path: [...path, "precision"],
      options: [null, "highp", "mediump", "lowp"],
      default: null
    })
  }
}
