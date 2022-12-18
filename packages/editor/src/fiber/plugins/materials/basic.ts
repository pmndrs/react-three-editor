import { Schema } from "leva/plugin"
import { EditableElement } from "../../../editable/EditableElement"
import { prop } from "../../controls/prop"
import { commonControls } from "./common"

export const meshBasicMaterial = (
  element: EditableElement,
  path: string[] = ["ref"]
): Schema => {
  return {
    color: prop.color({
      element,
      path: [...path, "color"]
    }),
    fog: prop.bool({
      element,
      path: [...path, "fog"]
    }),
    reflectivity: prop.number({
      element,
      path: [...path, "reflectivity"]
    }),
    refractionRatio: prop.number({
      element,
      path: [...path, "refractionRatio"]
    }),
    ...commonControls(element, path)
  }
}
