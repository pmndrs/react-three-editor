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
            path: ["ref", "position"],
            lock: true,
            step: 0.1
          }),
          rotation: prop.euler({
            lock: true,
            step: 1,
            path: ["ref", "rotation"],
            element: entity
          }),
          scale: prop.vector3d({
            element: entity,
            path: ["ref", "scale"],
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
          path: ["ref", "material", "color"]
        }),
        wireframe: prop.bool({
          element: entity,
          path: ["ref", "material", "wireframe"]
        }),
        diffuseMap: prop.texture({
          element: entity,
          path: ["ref", "material", "map"]
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
          path: ["ref", "color"]
        }),
        wireframe: prop.bool({
          element: entity,
          path: ["ref", "wireframe"]
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
        path: ["ref", "object"]
      }),
      enabled: prop.bool({
        element: entity,
        path: ["ref", "enabled"]
      }),
      makeDefault: prop(
        {
          get(o, p) {
            return o[p] ?? false
          },
          set() {},
          init() {
            console.log("HELLOOO")
            entity.props.makeDefault = true
            entity.render()
            console.log(entity)
          }
        },
        {
          element: entity,
          path: ["currentProps", "makeDefault"]
        }
      )
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
