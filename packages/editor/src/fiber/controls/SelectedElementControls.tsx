import { StoreType } from "leva/dist/declarations/src/types"
import { Fragment } from "react"
import { usePanel } from "../../editable/controls/Panel"
import { ElementControls } from "../../editable/controls/useElementControls"
import { EditableElement } from "../../editable/EditableElement"
import { useEditor } from "../../editable/useEditor"
import { useEditorStore } from "../../editable/useEditorStore"
import { useElementObserver } from "../useWatchElement"
import { ElementTransformControls } from "./ElementTransformControls"

export function SelectedElementControls({
  store = "scene",
  order
}: {
  store?: StoreType | string
  order?: number
}) {
  const panel = usePanel(store)
  const selectedElement = useEditorStore((state) =>
    state.selectedId ? state.elements[state.selectedId] : null
  )

  const mode = useEditor().useMode("editor")

  return selectedElement ? (
    <Fragment key={selectedElement.id}>
      <ElementControls
        element={selectedElement}
        store={panel.store}
        order={order}
      />
      <ElementWatcher element={selectedElement} />
      {selectedElement.isObject3D() && mode ? (
        <ElementTransformControls element={selectedElement} />
      ) : null}
    </Fragment>
  ) : null
}

function ElementWatcher({ element }: { element: EditableElement<any> }) {
  useElementObserver(element)
  return null
}