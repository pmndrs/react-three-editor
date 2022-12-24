import { prop } from "../controls/prop"
import { EditorControlsPlugin } from "../types"
import { geometry } from "./geometries"
import { group } from "./group"
import { material } from "./materials"
import { mesh } from "./mesh"
import {
  ambientLight,
  camera,
  color,
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

export const DEFAULT_EDITOR_PLUGINS: EditorControlsPlugin[] = [
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
  orbitControls,
  directionalLight,
  pointLight,
  ambientLight,
  spotLight,
  color,
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
