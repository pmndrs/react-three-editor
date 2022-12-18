import { geometry, meshGeometry } from "./geomtries"
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
  propControls,
  transform,
  reactComponent,
  transformWithoutRef,
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
]

export function addPlugin(plugin: any) {
  if (!DEFAULT_EDITOR_PLUGINS.includes(plugin)) {
    DEFAULT_EDITOR_PLUGINS.push(plugin)
  }
}
