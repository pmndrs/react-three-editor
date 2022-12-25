import { LeftPanel, RightPanel } from "../ui/panels/panel-tunnels"
import { ResizablePanelGroup } from "./prop-types/autoSizer"

export function PanelGroup({ side = "left" }) {
  let Group = side === "left" ? LeftPanel : RightPanel
  const tunnels = Group.useTunnels()
  if (Object.values(tunnels).filter(Boolean).length === 0) return null
  return (
    <div
      style={{
        width: "25vw",
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <ResizablePanelGroup autoSaveId={`${side}-panel`} direction="vertical">
        <Group.Outs />
      </ResizablePanelGroup>
    </div>
  )
}
