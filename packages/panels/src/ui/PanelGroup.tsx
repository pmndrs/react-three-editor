import { ResizablePanelGroup } from "./ResizablePanels"
import { LeftPanelGroup, RightPanelGroup } from "./tunnels"

export function PanelGroup({ side = "left" }) {
  let Group = side === "left" ? LeftPanelGroup : RightPanelGroup
  const tunnels = Group.useTunnels()
  if (Object.values(tunnels).filter(Boolean).length === 0) return <Group.Out />
  return (
    <div
      style={{
        width: "40vw",
        maxWidth: 320,
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <ResizablePanelGroup autoSaveId={`${side}-panel`} direction="vertical">
        <Group.Out />
      </ResizablePanelGroup>
    </div>
  )
}
