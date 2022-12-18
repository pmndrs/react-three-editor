import { folder } from "leva"
import { Material, Mesh } from "three"
import { EditorControlsPlugin } from "../../types"
import { meshBasicMaterial } from "./basic"
import { meshPhongMaterial } from "./phong"
import { meshPhysicalMaterial } from "./physical"
import { meshStandardMaterial } from "./standard"

export const material: EditorControlsPlugin = {
  applicable: (element) =>
    element.ref instanceof Material ||
    (element.ref instanceof Mesh && element.ref.material instanceof Material),
  controls: (element) => {
    const type =
      element.ref instanceof Mesh ? element.ref.material.type : element.ref.type
    const path = ["ref"]
    if (element.ref instanceof Mesh) {
      path.push("material")
    }
    let controls = (() => {
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
    })()
    return element.ref instanceof Mesh
      ? {
          material: folder(controls)
        }
      : controls
  }
}
