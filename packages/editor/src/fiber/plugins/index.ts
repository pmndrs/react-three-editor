import { useHelper } from "@react-three/drei"
import { BoxHelper } from "three"
import { EditableElement } from "../../editable/EditableElement"
import { useEditorStore } from "../../editable/Editor"
import { prop } from "../controls/prop"
import { geometry, meshGeometry } from "./geomtries"
import { material } from "./materials"
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
  },
  helper: ({ element }: { element: EditableElement }) => {
    const [{ camera }] = element.editor.useSettings("helpers", {
      mesh: { value: true }
    })
    const isSelected = useEditorStore(
      (state) => state.selectedId === element.id
    )
    useHelper(camera || isSelected ? element : undefined, BoxHelper)
    return null
  }
}

export const DEFAULT_EDITOR_PLUGINS = [
  transform,
  reactComponent,
  rigidBody,
  transformWithoutRef,
  camera,
  mesh,
  material,
  geometry,
  meshGeometry,
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
