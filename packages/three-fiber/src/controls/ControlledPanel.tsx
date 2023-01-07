import { useEditor } from "@editable-jsx/editable"
import { Panel, PanelProps } from "@editable-jsx/panels"
import { multiToggle } from "@editable-jsx/ui"

export function ControlledPanel(
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
