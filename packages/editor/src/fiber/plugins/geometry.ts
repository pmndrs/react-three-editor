import { EditableElement } from "@editable-jsx/core/EditableElement"
import { geometryControls } from "../prop-types/geometries"

export const geometry = {
  applicable: (object: any) => object.ref?.isBufferGeometry,
  controls: (element: EditableElement) => {
    return geometryControls({ element, path: ["ref"] })
  }
}
