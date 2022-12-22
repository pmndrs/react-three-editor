import { prop } from "../controls/prop"
import { geometry, meshGeometry } from "./geometries"
import { group } from "./group"
import { material } from "./materials"
import { mesh } from "./mesh"
import {
  ambientLight,
  camera,
  directionalLight,
  orbitControls,
  pointLight,
  propControls,
  reactComponent,
  rigidBody,
  spotLight,
  transform,
  transformWithoutRef
} from "./plugins"

export const DEFAULT_EDITOR_PLUGINS = [
  transform,
  reactComponent,
  transformWithoutRef,
  propControls,
  rigidBody,
  camera,
  mesh,
  group,
  material,
  geometry,
  meshGeometry,
  orbitControls,
  directionalLight,
  pointLight,
  ambientLight,
  spotLight,
  {
    applicable: (el) => el.type === "primitive",
    controls: (el) => {
      return {
        object: prop.ref({
          element: el,
          path: ["ref"]
        }),
        gltf: prop.gltf({
          element: el,
          path: ["currentProps", "object"]
        })
      }
    }
  }
]

export function addPlugin(plugin: any) {
  if (!DEFAULT_EDITOR_PLUGINS.includes(plugin)) {
    DEFAULT_EDITOR_PLUGINS.push(plugin)
  }
}
