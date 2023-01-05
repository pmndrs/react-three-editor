import { EditableElement } from "@editable-jsx/editable/EditableElement"
import { Schema } from "leva/plugin"

export const meshPhongMaterial = (
  element: EditableElement,
  path: string[] = ["ref"]
): Schema => {
  return {
    // ...commonControls(element, path),
    // ...texture(element, "map", path),
    // ...texture(element, "alpha", path),
    // ...texture(element, "ao", path),
    // ...texture(element, "bump", path),
    // ...texture(element, "displacement", path),
    // ...texture(element, "emissive", path, {
    //   emissiveColor: primitives.color({
    //     element,
    //     path: [...path, "emissive"],
    //     label: "color"
    //   })
    // }),
    // ...texture(element, "normal", path),
    // ...texture(element, "light", path)
  }
}
