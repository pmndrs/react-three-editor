import { levaStore } from "leva"
import React from "react"
import * as THREE from "three"
import { ElementControls } from "../editable/controls/useElementControls"
import { useEditorStore } from "../editable/Editor"
import { ElementTransformControls } from "./ElementTransformControls"

export function SelectedElementControls() {
  const selectedElement = useEditorStore((state) =>
    state.selectedId ? state.elements[state.selectedId] : null
  )

  console.log("selected", selectedElement)
  return selectedElement ? (
    <React.Fragment key={selectedElement.id}>
      <ElementControls element={selectedElement} store={levaStore} />
      {selectedElement.ref instanceof THREE.Object3D && (
        <ElementTransformControls element={selectedElement} />
      )}
    </React.Fragment>
  ) : null
}
