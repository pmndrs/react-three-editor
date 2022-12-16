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

export const DEFAULT_EDITOR_PLUGINS = [
  transform,
  transformWithoutRef,
  camera,
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
