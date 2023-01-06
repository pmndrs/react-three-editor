import { useEditor } from "@editable-jsx/editable"
import { Panel, PanelProps } from "@editable-jsx/panels"
import { multiToggle } from "@editable-jsx/ui"

function ControlledPanel(
  props: PanelProps
) {
  const editor = useEditor()
  const { side, floating, hidden } = editor.useSettings(
    "panels." + props.panel,
    {
      side: multiToggle({
        data: props.side ?? "left",
        options: ["left", "right"] as const
      }),
      floating: props.floating ?? false,
      hidden: props.hidden ?? false
    }
  )
  return <Panel {...props} side={side} floating={floating} hidden={hidden} />
}

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
          lazy
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
    </>
  )
}
