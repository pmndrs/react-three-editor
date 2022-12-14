import {
  transform,
  transformWithoutRef,
  camera,
  orbitControls,
  directionalLight,
  pointLight,
  ambientLight,
  spotLight,
  propControls
} from "./plugins"
import { material } from "./materials"

export const DEFAULT_EDITOR_PLUGINS = [
  transform,
  transformWithoutRef,
  camera,
  material,
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
