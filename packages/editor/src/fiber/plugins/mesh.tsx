import { BoxHelper } from "three"
import { EditableElement } from "../../editable"
import { all } from "../prop-types"

export const mesh = {
  applicable: (object: any) => object.ref?.isMesh,
  controls: (element: EditableElement) => {
    return all.mesh({ element, path: ["ref"] }).schema
  },
  helper: ({ element }: { element: EditableElement }) => {
    element.useHelper("mesh", BoxHelper)
    return null
  }
}
