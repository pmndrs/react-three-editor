import { EditableElement } from "@editable-jsx/editable"
import { geometryControls } from "../prop-types/geometries"

export const geometry = {
  applicable: (object: any) => object.ref?.isBufferGeometry,
  controls: (element: EditableElement) => {
    return geometryControls({ element, path: ["ref"] })
  }
}
