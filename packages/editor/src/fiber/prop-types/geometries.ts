import { folder } from "leva"
import { BufferGeometry } from "three"
import { all } from "."
import { EditableElement } from "../../editable/EditableElement"
import { replace } from "../plugins/replace"
import { PropInput } from "./core/types"

export const boxGeometryControls = (
  element: EditableElement,
  path: string[]
) => {
  return {
    args: {
      value: 0,
      render: () => false
    },
    width: all.number({
      element,
      default: 1,
      path: [...replace(path, "ref", "currentProps"), "args", "0"]
    }),
    height: all.number({
      element,
      default: 1,
      path: [...replace(path, "ref", "currentProps"), "args", "1"]
    }),
    depth: all.number({
      element,
      default: 1,
      path: [...replace(path, "ref", "currentProps"), "args", "2"]
    })
  }
}

export const geometryControls = ({ element, path }: PropInput) => {
  const type = element.getObjectByPath<BufferGeometry>(path)?.type
  switch (type) {
    case "BoxGeometry":
      return boxGeometryControls(element, path)
    default:
      return {}
  }
}

export const geometry = ({ element, path }: PropInput) => {
  return folder(geometryControls({ element, path }))
}
