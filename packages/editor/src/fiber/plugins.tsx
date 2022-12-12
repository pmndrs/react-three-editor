import { OrbitControls } from "three-stdlib"
import { DirectionalLight, Material, Mesh, Object3D } from "three"
import { folder } from "leva"
import { prop } from "./controls/prop"
import { EditableElement } from "../editable/EditableElement"

export const transform = {
  applicable: (entity: EditableElement) => entity.ref instanceof Object3D,
  controls: (entity: EditableElement) => {
    return {
      transform: folder(
        {
          position: prop.vector3d({
            element: entity,
            path: ["position"],
            lock: true,
            step: 0.1
          }),
          rotation: prop.euler({
            lock: true,
            step: 1,
            path: ["rotation"],
            element: entity
          }),
          scale: prop.vector3d({
            element: entity,
            path: ["scale"],
            lock: true,
            step: 0.1
          })
        },
        {
          collapsed: false
        }
      )
    }
  }
}
export const meshMaterial = {
  applicable: (entity: EditableElement) =>
    entity.ref instanceof Mesh && entity.ref.material,
  controls: (entity: EditableElement) => {
    return {
      material: folder({
        color: prop.color({
          element: entity,
          path: ["material", "color"]
        }),
        wireframe: prop.bool({
          element: entity,
          path: ["material", "wireframe"]
        }),
        diffuseMap: prop.texture({
          element: entity,
          path: ["material", "map"]
        })
      })
    }
  }
}
export const material = {
  applicable: (entity: EditableElement) => entity.ref instanceof Material,
  controls: (entity: EditableElement) => {
    return {
      material: folder({
        color: prop.color({
          element: entity,
          path: ["color"]
        }),
        wireframe: prop.bool({
          element: entity,
          path: ["wireframe"]
        })
      })
    }
  }
}
export const orbitControls = {
  applicable: (entity: EditableElement) => entity.ref instanceof OrbitControls,
  controls: (entity: EditableElement) => {
    return {
      target: prop.ref({
        element: entity,
        path: ["object"]
      })
    }
  }
}
export const directionalLight = {
  applicable: (entity: EditableElement) =>
    entity.ref instanceof DirectionalLight,
  controls: (entity: EditableElement) => {
    return {
      color: prop.color({
        element: entity,
        path: ["color"]
      }),
      intensity: prop.number({
        element: entity,
        step: 0.1,
        path: ["intensity"]
      })
    }
  }
}
