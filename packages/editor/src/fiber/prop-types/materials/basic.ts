import { Schema } from "leva/plugin"
import { primitives } from "../primitives"
import { texture } from "../texture"
import { commonControls } from "./common"

export const meshBasicMaterial = (
  element: Editable,
  path: string[] = ["ref"]
): Schema => {
  return {
    color: primitives.color({
      element,
      path: [...path, "color"]
    }),
    fog: primitives.bool({
      element,
      path: [...path, "fog"]
    }),
    reflectivity: primitives.number({
      element,
      path: [...path, "reflectivity"]
    }),
    refractionRatio: primitives.number({
      element,
      path: [...path, "refractionRatio"]
    }),

    ...commonControls(element, path),
    map: texture({
      collapsed: false,
      element: element,
      path: [...path, "map"]
    })
  }
}
