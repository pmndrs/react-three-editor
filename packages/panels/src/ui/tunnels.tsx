import { createMultiTunnel } from "@editable-jsx/ui"

export const Panels = createMultiTunnel()

export const PanelGroups = {
  left: createMultiTunnel(),
  center: createMultiTunnel(),
  right: createMultiTunnel()
}
