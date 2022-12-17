import { BoxGeometry } from "three"
import { EditableElement } from "../../editable/EditableElement"
import { prop } from "../controls/prop"

export const boxGeometryControls = (
  element: EditableElement,
  path: string[]
) => {
  return {
    width: prop.number({
      element,
      path: ["currentProps", "args", "0"]
    }),
    height: prop.number({
      element,
      path: ["currentProps", "args", "0"]
    }),
    depth: prop.number({
      element,
      path: ["currentProps", "args", "0"]
    })
  }
}

export const geometry = {
  applicable: (object: any) => object.ref?.isBufferGeometry,
  controls: (element: EditableElement) => {
    return {
      ...(element.ref instanceof BoxGeometry
        ? boxGeometryControls(element, ["ref"])
        : {})
    }
  }
}

export const meshGeometry = {}
