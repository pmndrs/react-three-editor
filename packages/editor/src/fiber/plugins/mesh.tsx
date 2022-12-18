import { BoxHelper } from "three"
import { EditableElement } from "../../editable/EditableElement"
import { prop } from "../controls/prop"

export const mesh = {
  applicable: (object: any) => object.ref?.isMesh,
  controls: (element: EditableElement) => {
    return {
      castShadow: prop.bool({
        element,
        path: ["ref", "castShadow"]
      }),
      receiveShadow: prop.bool({
        element,
        path: ["ref", "receiveShadow"]
      })
    }
  },
  helper: ({ element }: { element: EditableElement }) => {
    element.useHelper("mesh", BoxHelper)
    return null
  }
}
