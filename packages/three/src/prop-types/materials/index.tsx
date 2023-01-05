import { folder } from "leva"
import { PropInput } from "../core/types"

import { Material } from "three"
import { meshBasicMaterial } from "./basic"
import { meshPhongMaterial } from "./phong"
import { meshPhysicalMaterial } from "./physical"
import { meshStandardMaterial } from "./standard"

export const materialControls = ({ element, path }: PropInput) => {
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

export let material = (props: PropInput) => {
  return folder(materialControls(props))
}
