import { EditableThreeRoot } from "../EditableThreeRoot"
import { primitives } from "../prop-types/primitives"
import { EditorControlsPlugin } from "../types"
import { geometry } from "./geometry"
import { group } from "./group"
import { material } from "./material"
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
  geometry,
  material,
  orbitControls,
  directionalLight,
  pointLight,
  ambientLight,
  spotLight,
  color,
  {
    applicable: (e) => e instanceof EditableThreeRoot,
    controls(e) {
      return {
        shadows: primitives.bool({
          element: e,
          default: false,
          path: ["currentProps", "shadows"]
        })
      }
    }
  }
  // {
  //   applicable: (el) => el.type === "primitive",
  //   controls: (el) => {
  //     return {
  //       object: primitives.ref({
  //         element: el,
  //         path: ["ref"]
  //       }),
  //       gltf: primitives.gltf({
  //         element: el,
  //         path: ["currentProps", "object"]
  //       })
  //     }
  //   }
  // }
]

export function addPlugin(plugin: any) {
  if (!DEFAULT_EDITOR_PLUGINS.includes(plugin)) {
    DEFAULT_EDITOR_PLUGINS.push(plugin)
  }
}
