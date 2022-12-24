import { BoxGeometry } from "three"
import { EditableElement } from "../../editable/EditableElement"
import { prop } from "../controls/prop"

export const boxGeometryControls = (
  element: EditableElement,
  path: string[]
) => {
  return {
    args: {
      value: 0,
      render: () => false
    },
    width: prop.number({
      element,
      path: ["currentProps", "args", "0"]
    }),
    height: prop.number({
      element,
      path: ["currentProps", "args", "1"]
    }),
    depth: prop.number({
      element,
      path: ["currentProps", "args", "2"]
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
