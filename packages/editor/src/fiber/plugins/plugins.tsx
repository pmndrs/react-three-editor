import { EditableElement } from "@editable-jsx/core/EditableElement"
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
  Material,
  Mesh,
  Object3D,
  OrthographicCamera,
  PointLight,
  SpotLight,
  SpotLightHelper
} from "three"
import { TransformHelper } from "../controls/TransformHelper"
import { all } from "../prop-types"
import { createProp } from "../prop-types/core/createProp"
import { PropInput } from "../prop-types/core/types"
import { primitives } from "../prop-types/primitives"
import { replace } from "../prop-types/replace"

export const transform = {
  applicable: (entity: EditableElement) => entity.ref instanceof Object3D,
  icon: (entity: EditableElement) => "ph:cube",
  controls: (entity: EditableElement) => {
    return {
      transform: all.transform({
        element: entity,
        path: ["ref"]
      })
    }
  }
}

export const camera = {
  applicable: (entity: EditableElement) => entity.ref?.isCamera,
  icon: (entity: EditableElement) => "ph:video-camera-bold",
  controls: (entity: EditableElement) => {
    return {
      camera: cameraControls({ element: entity, path: ["ref"] })
    }
  },
  helper: ({ element }: { element: EditableElement }) => {
    element.useHelper("camera", CameraHelper)
    return null
  }
}

export const orbitControls = {
  applicable: (entity: EditableElement) => entity.type === OrbitControls,
  icon: (entity: EditableElement) => "mdi:orbit-variant",
  controls: (entity: EditableElement) => {
    return {
      target: primitives.ref({
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
}

export const directionalLight = {
  applicable: (entity: EditableElement) =>
    entity.ref instanceof DirectionalLight,
  icon: (entity: EditableElement) => "mdi:car-light-dimmed",
  controls: (entity: EditableElement) => {
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
  helper: ({ element }: { element: EditableElement }) => {
    element.useHelper("directionalLight", DirectionalLightHelper)
    return null
  }
}

export const pointLight = {
  applicable: (entity: EditableElement) => entity.ref instanceof PointLight,
  icon: (entity: EditableElement) => "ph:lightbulb-filament-bold",
  controls: (entity: EditableElement) => {
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
}

export const ambientLight = {
  applicable: (entity: EditableElement) => entity.ref instanceof AmbientLight,
  icon: (entity: EditableElement) => "ph:sun-bold",
  controls: (entity: EditableElement) => {
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
}

export const spotLight = {
  applicable: (entity: EditableElement) => entity.ref instanceof SpotLight,
  icon: (entity: EditableElement) => "mdi:spotlight-beam",
  controls: (entity: EditableElement) => {
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
  helper: ({ element }: { element: EditableElement }) => {
    element.useHelper("spotLight", SpotLightHelper)
    return null
  }
}

export const transformWithoutRef = {
  applicable: (entity: EditableElement) =>
    (!entity.forwardedRef &&
      (entity.currentProps.position ||
        entity.currentProps.rotation ||
        entity.currentProps.scale)) ||
    // RigidBody from rapier
    entity.ref?.raw,
  controls: (entity: EditableElement) => {
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

export const reactComponent = {
  applicable: (entity: EditableElement) => !entity.forwardedRef,
  icon: (entity: EditableElement) => "mdi:react"
}

export const rigidBody = {
  applicable: (entity: EditableElement) => entity.ref?.raw,
  icon: (entity: EditableElement) => "tabler:3d-cube-sphere"
}

export const propControls = {
  applicable: (entity: EditableElement) =>
    !entity.forwardedRef ||
    entity.type.controls ||
    (entity.forwardedRef &&
      !(entity.ref instanceof Mesh) &&
      !(entity.ref instanceof Light) &&
      !(entity.ref instanceof Camera) &&
      !(entity.ref instanceof Material)),
  controls: (entity: EditableElement) => {
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
}

export const color = {
  applicable: (entity: EditableElement) => entity.ref instanceof Color,
  controls: (entity: EditableElement) => {
    return {
      args: {
        value: 0,
        render: (args: any) => {
          false
        }
      },
      color: primitives.unknown({
        element: entity,
        path: ["currentProps", "args", "0"]
      })
    }
  }
}

function cameraControls({ element, path }: PropInput) {
  return folder({
    near: primitives.number({
      element: element,
      path: [...path, "near"],
      min: 0.1,
      max: 100
    }),
    far: primitives.number({
      element: element,
      path: [...path, "far"],
      min: 0.1,
      max: 10000
    }),
    ...(element.ref instanceof OrthographicCamera
      ? {
          zoom: primitives.number({
            element: element,
            path: [...path, "zoom"]
          }),
          top: primitives.number({
            element: element,
            path: [...replace(path, "ref", "currentProps"), "top"]
          }),
          bottom: primitives.number({
            element: element,
            path: [...replace(path, "ref", "currentProps"), "bottom"]
          }),
          left: primitives.number({
            element: element,
            path: [...replace(path, "ref", "currentProps"), "left"]
          }),
          right: primitives.number({
            element: element,
            path: [...replace(path, "ref", "currentProps"), "right"]
          })
        }
      : {}),

    fov: primitives.number({
      element: element,
      min: 0,
      max: 100,
      path: [...path, "fov"],
      onChange(value) {
        element.ref.updateProjectionMatrix()
      }
    })
  })
}
