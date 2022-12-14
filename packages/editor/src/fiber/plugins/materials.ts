import { folder } from "leva"
import { Material, MeshBasicMaterial, MeshStandardMaterial } from "three"
import { EditableElement } from "../../editable/EditableElement"
import { prop } from "../controls/prop"

export const material = {
  applicable: (entity: EditableElement) => entity.ref instanceof Material,
  icon: (entity: EditableElement) => "ph:paint-brush-broad-duotone",
  controls: (entity: EditableElement) => {
    return {
      color: prop.color({
        element: entity,
        path: ["ref", "color"]
      }),
      wireframe: prop.bool({
        element: entity,
        path: ["ref", "wireframe"]
      }),
      ...(entity.ref instanceof MeshStandardMaterial ||
      entity.ref instanceof MeshBasicMaterial
        ? {
            texture: prop.texture({
              element: entity,
              path: ["ref", "map"]
            })
          }
        : {}),
      ...(entity.ref instanceof MeshStandardMaterial
        ? {
            displacement: folder({
              displacementMap: prop.texture({
                element: entity,
                path: ["ref", "displacementMap"]
              }),
              scale: prop.number({
                element: entity,
                path: ["ref", "displacementScale"]
              }),
              bias: prop.number({
                element: entity,
                path: ["ref", "displacementBias"]
              })
            }),
            bump: folder({
              bumpMap: prop.texture({
                element: entity,
                path: ["ref", "bumpMap"]
              }),
              bumpScale: prop.number({
                element: entity,
                path: ["ref", "bumpScale"]
              }),
              bias: prop.number({
                element: entity,
                path: ["ref", "bumpBias"]
              })
            })
          }
        : {})
    }
  }
}
