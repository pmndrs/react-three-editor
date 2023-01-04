import { BoxHelper } from "three"
import { all } from "../prop-types"
import { ThreeEditableElement } from "../ThreeEditor"

export const mesh = {
  applicable: (object: ThreeEditableElement) => object.ref?.isMesh,
  controls: (element: ThreeEditableElement) => {
    return all.mesh({ element, path: ["ref"] }).schema
  },
  helper: ({ element }: { element: ThreeEditableElement }) => {
    element.useHelper("mesh", BoxHelper)
    return null
  }
}
