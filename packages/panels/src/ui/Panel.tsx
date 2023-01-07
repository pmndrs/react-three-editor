import { DockedPanel } from "./DockedPanel"
import { FloatingPanel } from "./FloatingPanel"
import { PanelProps } from "./types"

export function Panel({ floating, ...props }: PanelProps) {
  if (props.hidden) {
    return null
  }

  return floating ? <FloatingPanel {...props} /> : <DockedPanel {...props} />
}
