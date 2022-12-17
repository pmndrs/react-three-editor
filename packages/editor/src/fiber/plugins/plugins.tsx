import { OrbitControls, useHelper } from "@react-three/drei"
import { folder } from "leva"
import {
  AmbientLight,
  Camera,
  CameraHelper,
  DirectionalLight,
  DirectionalLightHelper,
  Light,
  Material,
  Mesh,
  Object3D,
  OrthographicCamera,
  PointLight,
  SpotLight,
  SpotLightHelper
} from "three"
import { usePersistedControls } from "../../editable/controls/usePersistedControls"
import { EditableElement } from "../../editable/EditableElement"
import { useEditorStore } from "../../editable/Editor"
import { prop } from "../controls/prop"
import { TransformHelper } from "../TransformHelper"

export const transform = {
  applicable: (entity: EditableElement) => entity.ref instanceof Object3D,
  icon: (entity: EditableElement) => "ph:cube",
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

export const camera = {
  applicable: (entity: EditableElement) => entity.ref?.isCamera,
  icon: (entity: EditableElement) => "ph:video-camera-bold",
  controls: (entity: EditableElement) => {
    return {
      camera: folder({
        near: prop.number({
          element: entity,
          path: ["ref", "near"],
          min: 0.1,
          max: 100
        }),
        far: prop.number({
          element: entity,
          path: ["ref", "far"],
          min: 0.1,
          max: 10000
        }),
        ...(entity.ref instanceof OrthographicCamera
          ? {
              zoom: prop.number({
                element: entity,
                path: ["ref", "zoom"]
              }),
              top: prop.number({
                element: entity,
                path: ["currentProps", "top"]
              }),
              bottom: prop.number({
                element: entity,
                path: ["currentProps", "bottom"]
              }),
              left: prop.number({
                element: entity,
                path: ["currentProps", "left"]
              }),
              right: prop.number({
                element: entity,
                path: ["currentProps", "right"]
              })
            }
          : {}),

        fov: prop.number({
          element: entity,
          min: 0,
          max: 100,
          path: ["ref", "fov"],
          onChange(value) {
            entity.ref.updateProjectionMatrix()
          }
        })
      })
    }
  },
  helper: ({ element }: { element: EditableElement }) => {
    const [{ camera }] = usePersistedControls("editor.helpers", {
      camera: { value: true }
    })
    const isSelected = useEditorStore(
      (state) => state.selectedId === element.id
    )
    useHelper(camera || isSelected ? element : undefined, CameraHelper)
    return null
  }
}

// export const meshMaterial = {
//   applicable: (entity: EditableElement) =>
//     entity.ref instanceof Mesh && entity.ref.material,
//   controls: (entity: EditableElement) => {
//     return {
//       material: folder({
//         ...(entity.ref.material instanceof MeshStandardMaterial ||
//         entity.ref.material instanceof MeshBasicMaterial
//           ? {
//               color: prop.color({
//                 element: entity,
//                 path: ["ref", "material", "color"]
//               }),
//               texture: prop.texture({
//                 element: entity,
//                 path: ["ref", "material", "map"]
//               })
//             }
//           : {}),

//         wireframe: prop.bool({
//           element: entity,
//           path: ["ref", "material", "wireframe"]
//         })
//       })
//     }
//   }
// }

export const orbitControls = {
  applicable: (entity: EditableElement) => entity.type === OrbitControls,
  icon: (entity: EditableElement) => "mdi:orbit-variant",
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
  icon: (entity: EditableElement) => "mdi:car-light-dimmed",
  controls: (entity: EditableElement) => {
    return {
      color: prop.color({
        element: entity,
        path: ["ref", "color"]
      }),
      intensity: prop.number({
        element: entity,
        step: 0.1,
        path: ["ref", "intensity"]
      })
    }
  },
  helper: ({ element }: { element: EditableElement }) => {
    const [{ directionalLight }] = usePersistedControls("editor.helpers", {
      directionalLight: { value: true }
    })
    useHelper(directionalLight ? element : undefined, DirectionalLightHelper)
    return null
  }
}

export const pointLight = {
  applicable: (entity: EditableElement) => entity.ref instanceof PointLight,
  icon: (entity: EditableElement) => "ph:lightbulb-filament-bold",
  controls: (entity: EditableElement) => {
    return {
      color: prop.color({
        element: entity,
        path: ["ref", "color"]
      }),
      intensity: prop.number({
        element: entity,
        step: 0.1,
        path: ["ref", "intensity"]
      })
    }
  }
}

export const ambientLight = {
  applicable: (entity: EditableElement) => entity.ref instanceof AmbientLight,
  icon: (entity: EditableElement) => "ph:sun-bold",
  controls: (entity: EditableElement) => {
    return {
      color: prop.color({
        element: entity,
        path: ["ref", "color"]
      }),
      intensity: prop.number({
        element: entity,
        step: 0.1,
        path: ["ref", "intensity"]
      })
    }
  }
}

export const spotLight = {
  applicable: (entity: EditableElement) => entity.ref instanceof SpotLight,
  icon: (entity: EditableElement) => "mdi:spotlight-beam",
  controls: (entity: EditableElement) => {
    return {
      intensity: prop.number({
        element: entity,
        step: 0.1,
        path: ["ref", "intensity"]
      }),
      target: prop.ref({
        element: entity,
        path: ["ref", "target"]
      }),
      angle: prop.number({
        element: entity,
        step: 0.1,
        path: ["ref", "angle"]
      })
    }
  },
  helper: ({ element }: { element: EditableElement }) => {
    const [{ spotLight }] = usePersistedControls("editor.helpers", {
      spotLight: { value: true }
    })
    useHelper(spotLight ? element : undefined, SpotLightHelper, "hotpink")
    return null
  }
}

export const transformWithoutRef = {
  applicable: (entity: EditableElement) => !entity.forwardedRef,
  icon: (entity: EditableElement) => "mdi:react",
  helper: ({ element }: { element: EditableElement }) => {
    return (
      <TransformHelper
        key={element.id}
        editableElement={element}
        props={element.currentProps}
      />
    )
  }
}

export const propControls = {
  applicable: (entity: EditableElement) =>
    entity.type !== "string" &&
    (!entity.forwardedRef ||
      entity.type.controls ||
      (entity.forwardedRef &&
        !(entity.ref instanceof Mesh) &&
        !(entity.ref instanceof Light) &&
        !(entity.ref instanceof Camera) &&
        !(entity.ref instanceof Material))),
  controls: (entity: EditableElement) => {
    let controls: Record<string, any> = {}
    if (entity.type.controls) {
      Object.entries(entity.type.controls)
        .map(([k, { type = "unknown", value, ...v }]: any) => {
          return [
            k,
            prop[type as keyof typeof prop]({
              ...v,
              element: entity,
              path: ["currentProps", k],
              default: value
            })
          ]
        })
        .forEach(([k, v]) => {
          controls[k] = v
        })
    }

    let IGNORED_PROPS = ["position", "rotation", "scale", "_source", "children"]

    let isControllable = (v: any) => {
      return (
        typeof v === "number" ||
        typeof v === "string" ||
        typeof v === "boolean" ||
        Array.isArray(v)
      )
    }

    Object.entries(entity.currentProps).forEach(([k, v]) => {
      if (!controls[k] && !IGNORED_PROPS.includes(k) && isControllable(v)) {
        controls[k] = prop.unknown({
          element: entity,
          path: ["currentProps", k]
        })
      }
    })
    return controls
  }
}
