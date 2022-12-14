import { levaStore } from "leva"
import React from "react"
import * as THREE from "three"
import { ElementTransformControls } from "./ElementTransformControls"
import { useElementControls } from "../editable/controls/useElementControls"
import { EditableElement } from "../editable/EditableElement"
import { useEditorStore } from "../editable/Editor"

export function SelectedElement() {
  const selectedElement = useEditorStore((state) =>
    state.selectedId ? state.elements[state.selectedId] : null
  )
  console.log(selectedElement)
  return selectedElement ? (
    <React.Fragment key={selectedElement.id}>
      <ElementControls element={selectedElement} store={levaStore} />
      {selectedElement.ref instanceof THREE.Object3D && (
        <ElementTransformControls element={selectedElement} />
      )}
    </React.Fragment>
  ) : null
}

export function ElementControls({
  element,
  store
}: {
  element: EditableElement
  store: typeof levaStore
}) {
  useElementControls("entity", element, { store, order: -1 })
  return null
}
