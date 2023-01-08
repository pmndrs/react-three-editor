import { ControlledDynamicIsland } from "./ui/ControlledDynamicIsland"
import { ControlledPanel } from "./ui/ControlledPanel"
import { useEditor } from "./useEditor"

export function EditorPanels() {
  const editor = useEditor()
  const selectedElement = editor.useState(() => editor.selectedElement)

  return (
    <>
      <ControlledPanel
        panel="scene"
        title="scene"
        order={0}
        lazy={100}
        side="left"
      />
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
