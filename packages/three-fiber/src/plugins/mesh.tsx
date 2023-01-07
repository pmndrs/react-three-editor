import { BoxHelper } from "three"
import { EditableThreeElement } from "../EditableThreeRoot"
import { all } from "../prop-types"

export const mesh = {
  applicable: (object: EditableThreeElement) => object.ref?.isMesh,
  controls: (element: EditableThreeElement) => {
    return all.mesh({ element, path: ["ref"] }).schema
  },
  helper: ({ element }: { element: EditableThreeElement }) => {
    element.useHelper("mesh", BoxHelper)
    return null
  }
}
