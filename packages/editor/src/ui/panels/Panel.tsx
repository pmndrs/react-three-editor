import { DockedPanel } from "./DockedPanel"
import { FloatingLevaPanel, OurPanelProps } from "./LevaPanel"
import { FloatingPanels } from "./panel-tunnels"

export function Panel({
  side,
  floating,
  lazy,
  ...props
}: OurPanelProps & { order?: number; lazy?: boolean }) {
  if (props.hidden) {
    return null
  }
  if (floating) {
    return (
      <FloatingPanels.In>
        <FloatingLevaPanel
          panel={props.panel}
          title={props.title}
          side={side}
          reveal={lazy}
          width={320}
          collapsed={false}
        />
      </FloatingPanels.In>
    )
  }

  return <DockedPanel side={side} {...props} />
}
