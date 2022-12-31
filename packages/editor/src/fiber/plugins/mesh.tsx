import { EditableElement } from "@editable-jsx/core"
import { BoxHelper } from "three"
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
