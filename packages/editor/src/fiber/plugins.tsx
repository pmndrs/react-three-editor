import {
  AmbientLight,
  DirectionalLight,
  DirectionalLightHelper,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  SpotLight,
  SpotLightHelper
} from "three"
import { folder } from "leva"
import { prop } from "./controls/prop"
import { EditableElement } from "../editable/EditableElement"
import { TransformHelper } from "./TransformHelper"
import React from "react"
import { useHelper, OrbitControls } from "@react-three/drei"

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
  icon: (entity: EditableElement) => "ph:video-camera-bold"
}
export const meshMaterial = {
  applicable: (entity: EditableElement) =>
    entity.ref instanceof Mesh && entity.ref.material,
  controls: (entity: EditableElement) => {
    return {
      material: folder({
        ...(entity.ref.material instanceof MeshStandardMaterial ||
        entity.ref.material instanceof MeshBasicMaterial
          ? {
              color: prop.color({
                element: entity,
                path: ["ref", "material", "color"]
              }),
              map: prop.texture({
                element: entity,
                path: ["ref", "material", "map"]
              })
            }
          : {}),

        wireframe: prop.bool({
          element: entity,
          path: ["ref", "material", "wireframe"]
        })
      })
    }
  }
}
export const material = {
  applicable: (entity: EditableElement) => entity.ref instanceof Material,
  icon: (entity: EditableElement) => "ph:paint-brush-broad-duotone",
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
        }),
        map: prop.texture({
          element: entity,
          path: ["ref", "map"]
        }),
        displacementMap: prop.texture({
          element: entity,
          path: ["ref", "displacementMap"]
        })
      })
    }
  }
}
export const orbitControls = {
  applicable: (entity: EditableElement) => entity.type === OrbitControls,
  icon: (entity) => "mdi:orbit-variant",
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
    useHelper(element, DirectionalLightHelper)
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
    useHelper(element, SpotLightHelper, "hotpink")
    return null
  }
}

const transformWithoutRef = {
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

export const DEFAULT_EDITOR_PLUGINS = [
  transform,
  transformWithoutRef,
  camera,
  meshMaterial,
  material,
  orbitControls,
  directionalLight,
  pointLight,
  ambientLight,
  spotLight,
  {
    applicable: (entity: EditableElement) =>
      entity.type !== "string" && entity.type.controls,
    controls: (entity: EditableElement) => {
      return Object.fromEntries(
        Object.entries(entity.type.controls).map(
          ([k, { type, value, ...v }]) => {
            return [
              k,
              prop[type]({
                ...v,
                element: entity,
                path: ["currentProps", k],
                default: value
              })
            ]
          }
        )
      )
    }
  }
  // {
  //   applicable: (entity: EditableElement) =>
  //     !entity.forwardedRef || entity.type !== "string",
  //   controls: (entity: EditableElement) => {
  //     return Object.fromEntries(
  //       Object.entries(entity.currentProps)
  //         .filter(
  //           ([e]) =>
  //             ![
  //               "position",
  //               "rotation",
  //               "scale",
  //               "_source",
  //               "children",
  //               "ref",
  //               "key"
  //             ].includes(e)
  //         )
  //         .map(([k, v]) => {
  //           return [
  //             k,
  //             prop(
  //               {
  //                 get(o, p) {
  //                   return o[p] ?? v
  //                 },
  //                 set(o, p) {
  //                   o[p] = v
  //                   return true
  //                 }
  //               },
  //               {
  //                 ...(entity.type.controls?.[k] ?? {}),
  //                 element: entity,
  //                 path: ["currentProps", k],
  //                 default: v
  //               }
  //             )
  //           ]
  //         })
  //     )
  //   }
  // }
]

export function addPlugin(plugin: any) {
  if (!DEFAULT_EDITOR_PLUGINS.includes(plugin)) {
    DEFAULT_EDITOR_PLUGINS.push(plugin)
  }
}
