import * as Stitches from "@stitches/react"
import { styled } from "@editable-jsx/ui"

export { PanelManager } from "./PanelManager"
export { PanelsProvider } from "./PanelsProvider"
export { Panel } from "./ui/Panel"
export { DockedPanelGroup as PanelGroup } from "./ui/PanelGroup"
export * from "./ui/tunnels"
export * from "./ui/types"
export { usePanel } from "./usePanel"
export { PanelManagerContext, usePanelManager } from "./usePanelManager"

export const PanelContainer = styled("div", {
  display: "flex",
  height: "100vh",
  flexDirection: "row",
  width: "100vw"
})
