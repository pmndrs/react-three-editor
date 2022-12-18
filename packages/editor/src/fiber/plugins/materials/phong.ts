import { Schema } from "leva/plugin"
import { EditableElement } from "../../../editable/EditableElement"
import { prop } from "../../controls/prop"
import { commonControls } from "./common"
import { createTextureFolder } from "./utils"

export const meshPhongMaterial = (
  element: EditableElement,
  path: string[] = ["ref"]
): Schema => {
  console.log("Generating the phong material")
  return {
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
    ...createTextureFolder(element, "normal", path),
    ...createTextureFolder(element, "light", path)
  }
}
