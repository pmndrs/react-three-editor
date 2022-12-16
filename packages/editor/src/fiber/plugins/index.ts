import { EditableElement } from "../../editable/EditableElement"
import { prop } from "../controls/prop"
import { material, meshMaterial } from "./materials"
import {
  ambientLight,
  camera,
  directionalLight,
  orbitControls,
  pointLight,
  propControls,
  spotLight,
  transform,
  transformWithoutRef
} from "./plugins"

const mesh = {
  applicable: (object: any) => object.ref?.isMesh,
  controls: (element: EditableElement) => {
    return {
      castShadow: prop.bool({
        element,
        path: ["ref", "castShadow"]
      }),
      receiveShadow: prop.bool({
        element,
        path: ["ref", "receiveShadow"]
      })
    }
  }
}

export const DEFAULT_EDITOR_PLUGINS = [
  transform,
  transformWithoutRef,
  camera,
  mesh,
  material,
  meshMaterial,
  orbitControls,
  directionalLight,
  pointLight,
  ambientLight,
  spotLight,
  propControls
]

export function addPlugin(plugin: any) {
  if (!DEFAULT_EDITOR_PLUGINS.includes(plugin)) {
    DEFAULT_EDITOR_PLUGINS.push(plugin)
  }
}
