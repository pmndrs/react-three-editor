import { styled } from "@editable-jsx/controls"

export { PanelManager } from "./PanelManager"
export { Panel } from "./ui/Panel"
export { DockedPanelGroup as PanelGroup } from "./ui/PanelGroup"
export * from "./ui/tunnels"
export { usePanel } from "./usePanel"
export { PanelManagerContext, usePanelManager } from "./usePanelManager"

export const PanelContainer = styled("div", {
  display: "flex",
  height: "100vh",
  flexDirection: "row",
  width: "100vw"
})
