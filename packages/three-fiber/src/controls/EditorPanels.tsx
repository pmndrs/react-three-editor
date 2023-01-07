import { useEditor } from "@editable-jsx/editable"
import { ControlledDynamicIsland } from "./ControlledDynamicIsland"
import { ControlledPanel } from "./ControlledPanel"

export function EditorPanels() {
  const editor = useEditor()
  const selectedElement = editor.useState(() => editor.selectedElement)

  return (
    <>
      <ControlledPanel panel="scene" title="scene" order={0} lazy side="left" />
      {selectedElement ? (
        <ControlledPanel
          panel="properties"
          title="properties"
          side="right"
          key={selectedElement.id}
          order={1}
        />
      ) : (
        <ControlledPanel
          panel="settings"
          title="settings"
          order={1}
          side="right"
        />
      )}
      <ControlledDynamicIsland />
    </>
  )
}
