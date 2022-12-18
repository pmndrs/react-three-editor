import { StoreType } from "leva/dist/declarations/src/types"
import { Fragment } from "react"
import { ElementControls } from "../editable/controls/useElementControls"
import { useEditorStore } from "../editable/Editor"
import { ElementTransformControls } from "./ElementTransformControls"
import { usePanel } from "./usePanel"

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

  return selectedElement ? (
    <Fragment key={selectedElement.id}>
      <ElementControls
        element={selectedElement}
        store={panel.store}
        order={order}
      />
      {selectedElement.isObject3D() ? (
        <ElementTransformControls element={selectedElement} />
      ) : null}
    </Fragment>
  ) : null
}
