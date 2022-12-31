import { BoxHelper } from "three"
import { all } from "../prop-types"

export const mesh = {
  applicable: (object: any) => object.ref?.isMesh,
  controls: (element: Editable) => {
    return all.mesh({ element, path: ["ref"] }).schema
  },
  helper: ({ element }: { element: Editable }) => {
    element.useHelper("mesh", BoxHelper)
    return null
  }
}
