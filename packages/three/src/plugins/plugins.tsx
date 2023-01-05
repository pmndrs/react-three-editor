import { createProp, EditableElement } from "@editable-jsx/editable"
import { InputTypes } from "@editable-jsx/state"
import { OrbitControls } from "@react-three/drei"
import { folder } from "leva"
import {
  AmbientLight,
  Camera,
  CameraHelper,
  Color,
  DirectionalLight,
  DirectionalLightHelper,
  Light,
  Mesh,
  Object3D,
  PointLight,
  SpotLight,
  SpotLightHelper
} from "three"
import { TransformHelper } from "../controls/TransformHelper"
import { all } from "../prop-types"
import { primitives } from "../prop-types/primitives"
import { ThreeEditableElement } from "../ThreeEditor"
import { EditorControlsPlugin } from "../types"

function createPlugin<
  Element extends EditableElement = EditableElement,
  T extends EditorControlsPlugin<Element> = EditorControlsPlugin<Element>
>(a: T): T {
  return a
}

export const transform = createPlugin<ThreeEditableElement>({
  applicable: (entity) => entity.ref instanceof Object3D,
  icon: (entity) => "ph:cube",
  controls: (entity) => {
    return {
      transform: all.transform({
        element: entity,
        path: ["ref"]
      })
    }
  }
})

export const camera = createPlugin<ThreeEditableElement>({
  applicable: (entity) => entity.ref?.isCamera,
  icon: (entity) => "ph:video-camera-bold",
  controls: (entity) => {
    return {
      camera: all.camera({ element: entity, path: ["ref"] })
    }
  },
  helper: ({ element }) => {
    element.useHelper("camera", CameraHelper)
    return null
  }
})

export const orbitControls = createPlugin<ThreeEditableElement>({
  applicable: (entity) => entity.type === OrbitControls,
  icon: (entity) => "mdi:orbit-variant",
  controls: (entity) => {
    return {
      object: primitives.ref({
        element: entity,
        path: ["ref", "object"]
      }),
      enabled: primitives.bool({
        element: entity,
        path: ["ref", "enabled"]
      }),
      makeDefault: createProp(
        {
          get(o, p) {
            return o[p] ?? false
          },
          set() {}
        },
        {
          element: entity,
          path: ["currentProps", "makeDefault"]
        }
      )
    }
  }
})

export const directionalLight = createPlugin<ThreeEditableElement>({
  applicable: (entity) => entity.ref instanceof DirectionalLight,
  icon: (entity) => "mdi:car-light-dimmed",
  controls: (entity) => {
    return {
      color: primitives.color({
        element: entity,
        path: ["ref", "color"]
      }),
      intensity: primitives.number({
        element: entity,
        step: 0.1,
        path: ["ref", "intensity"]
      }),
      castShadow: primitives.bool({
        element: entity,
        path: ["ref", "castShadow"]
      })
    }
  },
  helper: ({ element }) => {
    element.useHelper("directionalLight", DirectionalLightHelper)
    return null
  }
})

export const pointLight = createPlugin<ThreeEditableElement>({
  applicable: (entity) => entity.ref instanceof PointLight,
  icon: (entity) => "ph:lightbulb-filament-bold",
  controls: (entity) => {
    return {
      color: primitives.color({
        element: entity,
        path: ["ref", "color"]
      }),
      intensity: primitives.number({
        element: entity,
        step: 0.1,
        path: ["ref", "intensity"]
      })
    }
  }
})

export const ambientLight = createPlugin<ThreeEditableElement>({
  applicable: (entity) => entity.ref instanceof AmbientLight,
  icon: (entity) => "ph:sun-bold",
  controls: (entity) => {
    return {
      color: primitives.color({
        element: entity,
        path: ["ref", "color"]
      }),
      intensity: primitives.number({
        element: entity,
        step: 0.1,
        path: ["ref", "intensity"]
      })
    }
  }
})

export const spotLight = createPlugin<ThreeEditableElement>({
  applicable: (entity) => entity.ref instanceof SpotLight,
  icon: (entity) => "mdi:spotlight-beam",
  controls: (entity) => {
    return {
      intensity: primitives.number({
        element: entity,
        step: 0.1,
        path: ["ref", "intensity"]
      }),
      target: primitives.ref({
        element: entity,
        path: ["ref", "target"]
      }),
      angle: primitives.number({
        element: entity,
        step: 0.1,
        path: ["ref", "angle"]
      }),
      castShadow: primitives.bool({
        element: entity,
        path: ["ref", "castShadow"]
      })
    }
  },
  helper: ({ element }) => {
    element.useHelper("spotLight", SpotLightHelper)
    return null
  }
})

export const transformWithoutRef = createPlugin<ThreeEditableElement>({
  applicable: (entity) =>
    (!entity.forwardedRef &&
      (entity.currentProps.position ||
        entity.currentProps.rotation ||
        entity.currentProps.scale)) ||
    // RigidBody from rapier
    entity.ref?.raw,
  controls: (entity) => {
    return {
      transform: folder(
        {
          position: primitives.vector3d({
            element: entity,
            path: ["object", "position"],
            step: 0.1
          }),
          rotation: primitives.euler({
            step: 1,
            path: ["object", "rotation"],
            element: entity
          }),
          scale: primitives.vector3d({
            element: entity,
            path: ["object", "scale"],
            lock: true,
            step: 0.1
          })
        },
        {
          collapsed: false
        }
      )
    }
  },
  helper: ({ element }) => {
    return (
      <TransformHelper
        key={element.id}
        editableElement={element}
        props={element.currentProps}
      />
    )
  }
})

export const reactComponent = createPlugin<ThreeEditableElement>({
  applicable: (entity) => !entity.forwardedRef,
  icon: (entity) => "mdi:react"
})

export const rigidBody = createPlugin<ThreeEditableElement>({
  applicable: (entity) => entity.ref?.raw,
  icon: (entity) => "tabler:3d-cube-sphere"
})

export const propControls = createPlugin<ThreeEditableElement>({
  applicable: (entity) =>
    !entity.forwardedRef ||
    entity.type.controls ||
    (entity.forwardedRef &&
      !(entity.ref instanceof Mesh) &&
      !(entity.ref instanceof Light) &&
      !(entity.ref instanceof Camera)),
  controls: (entity) => {
    let controls: Record<string, any> = {}
    if (entity.type.controls) {
      Object.entries(entity.type.controls)
        .map(([k, { type = "unknown", value, ...v }]: any) => {
          return [
            k,
            primitives[type as keyof typeof primitives]({
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

    let IGNORED_PROPS = ["_source", "children"]

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
        let val = entity.currentProps[k]

        let props = {}
        if (typeof val === "number") {
          props.step = val / 100.0
          if (val % 1 === 0) {
            props.step = 1
          }
        }
        controls[k] = primitives.unknown({
          element: entity,
          path: ["currentProps", k],
          ...props
        })
      }
    })
    return controls
  }
})

export const color = createPlugin<ThreeEditableElement>({
  applicable: (entity) => entity.ref instanceof Color,
  controls: (entity) => {
    return {
      args: {
        type: InputTypes.NUMBER,
        value: 0,
        render: () => false
      },
      color: primitives.unknown({
        element: entity,
        path: ["args", "0"]
      })
    }
  }
})
