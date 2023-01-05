import { useEditor } from "@editable-jsx/editable"
import { Panel, PanelProps } from "@editable-jsx/panels"
import { multiToggle } from "@editable-jsx/ui"
import { DynamicIsland } from "./BottomBar"

function ControlledPanel(
  props: PanelProps & { order?: number; lazy?: boolean }
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

function ControlledDynamicIsland() {
  const editor = useEditor()
  const { placement, side, hidden } = editor.useSettings("panels.island", {
    placement: multiToggle({
      data: "bottom",
      options: ["top", "bottom"] as const
    }),
    side: multiToggle({
      data: "center",
      options: ["left", "center", "right"] as const
    }),
    hidden: false
  })

  return <DynamicIsland placement={placement} side={side} hidden={hidden} />
}
