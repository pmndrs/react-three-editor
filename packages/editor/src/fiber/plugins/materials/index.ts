import { Material } from "three"
import { EditableElement } from "../../../editable/EditableElement"
import { EditorControlsPlugin } from "../../types"
import { meshBasicMaterial } from "./basic"
import { meshPhongMaterial } from "./phong"
import { meshPhysicalMaterial } from "./physical"
import { meshStandardMaterial } from "./standard"

export const materialControls = ({
  element,
  path
}: {
  element: EditableElement
  path: string[]
}) => {
  const type = element.getObjectByPath<Material>(path)?.type
  switch (type) {
    case "MeshBasicMaterial":
      return meshBasicMaterial(element, path)
    case "MeshPhongMaterial":
      return meshPhongMaterial(element, path)
    case "MeshStandardMaterial":
      return meshStandardMaterial(element, path)
    case "MeshPhysicalMaterial":
      return meshPhysicalMaterial(element, path)
    default:
      return {}
  }
}

export const material: EditorControlsPlugin = {
  applicable: (element) => element.ref instanceof Material,
  controls: (element) => {
    return materialControls({ element, path: ["ref"] })
  }
}
