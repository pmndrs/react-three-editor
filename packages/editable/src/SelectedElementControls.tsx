import { usePanel } from "@editable-jsx/panels"
import { Fragment, useEffect } from "react"
import { ElementControls } from "./ElementControls"
import { useEditor } from "./useEditor"

export function SelectedElementControls({
  panel: store = "scene",
  order
}: {
  panel?: string
  order?: number
}) {
  const panel = usePanel(store)
  const editor = useEditor()
  const selectedElement = editor.useSelectedElement()
  console.log(selectedElement)
  const isEditorMode = editor.useStates("editing")

  useEffect(() => {
    return () => {
      if (!selectedElement) return
      selectedElement.properties.useStore.setState(({ data }) => {
        return {
          data: {
            name: data.name
          }
        }
      })
    }
  }, [selectedElement])

  return selectedElement ? (
    <Fragment key={selectedElement.id}>
      <ElementControls
        element={selectedElement}
        store={panel.store}
        order={order}
      />
    </Fragment>
  ) : null
}
