import { EditableElement } from "@editable-jsx/editable/EditableElement"
import { BackSide, DoubleSide, FrontSide, Material } from "three"
import { primitives } from "../primitives"

export const commonControls = (
  element: EditableElement,
  path: string[] = ["ref"]
) => {
  return {
    transparent: primitives.bool({
      element,
      path: [...path, "transparent"],
      onChange: () => {
        const object = element.getObjectByPath<Material>(path)
        object.needsUpdate = true
      }
    }),
    opacity: primitives.bool({
      element,
      path: [...path, "opacity"],
      min: 0,
      max: 1,
      step: 0.1
    }),
    toneMapped: primitives.bool({
      element,
      path: [...path, "tonemapped"]
    }),
    side: primitives.select({
      element,
      path: [...path, "side"],
      options: {
        FrontSide,
        BackSide,
        DoubleSide
      }
    }),
    shadowSide: primitives.select({
      element,
      path: [...path, "shadowSide"],
      default: "null",
      options: {
        FrontSide,
        BackSide,
        DoubleSide
      }
    }),
    precision: primitives.select({
      element,
      path: [...path, "precision"],
      options: [null, "highp", "mediump", "lowp"],
      default: null
    })
  }
}
