import { StoreType } from "leva/dist/declarations/src/types"
import { Fragment } from "react"
import { EditableElement, ElementControls, useEditor } from "../../editable"
import { usePanel } from "../../ui/Panel"
import { useElementObserver } from "../useWatchElement"

export function SelectedElementControls({
  store = "scene",
  order
}: {
  store?: StoreType | string
  order?: number
}) {
  const panel = usePanel(store)
  const editor = useEditor()
  const selectedElement = editor.useSelectedElement()
  console.log(selectedElement?.id)
  const isEditorMode = editor.useStates("editing")

  return selectedElement ? (
    <Fragment key={selectedElement.id}>
      <ElementControls
        element={selectedElement}
        store={panel.store}
        order={order}
      />
      {/* <ElementWatcher element={selectedElement} /> */}
      {/* {selectedElement.isObject3D() && isEditorMode ? (
        <ElementTransformControls element={selectedElement} />
      ) : null} */}
    </Fragment>
  ) : null
}

function ElementWatcher({ element }: { element: EditableElement<any> }) {
  useElementObserver(element)
  return null
}
