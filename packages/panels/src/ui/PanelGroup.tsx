import {
  Panel as ResizablePanel,
  PanelResizeHandle
} from "react-resizable-panels"
import { ResizablePanelGroup } from "./ResizablePanels"
import { PanelGroups } from "./tunnels"
export function PanelRoot({ children }) {
  return (
    <div
      style={{
        width: "100vw",
        // width: "40vw",
        height: "100vh",
        display: "flex",
        flexDirection: "row"
      }}
    >
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          id={"left"}
          className="horizontal-panel"
          defaultSize={0.3}
        >
          <div
            style={{
              width: "calc(100% - 8px)",
              height: "100%"
            }}
          >
            <DockedPanelGroup side={"left"} />
          </div>
          <PanelResizeHandle>
            <div className={"horizontal-handle"} />
          </PanelResizeHandle>
        </ResizablePanel>
        <ResizablePanel
          id={"center"}
          className="horizontal-panel"
          defaultSize={0.4}
        >
          {
            <div
              style={{
                width: "calc(100% - 8px)",
                height: "100%"
              }}
            >
              {children}
            </div>
          }
          <PanelResizeHandle>
            <div className={"horizontal-handle"} />
          </PanelResizeHandle>
        </ResizablePanel>
        <ResizablePanel
          id={"right"}
          className="horizontal-panel"
          defaultSize={0.3}
        >
          <div
            style={{
              width: "calc(100%)",
              height: "100%"
            }}
          >
            <DockedPanelGroup side={"right"} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export function DockedPanelGroup({
  side = "left" as keyof typeof PanelGroups,
  style = {}
}) {
  let Group = PanelGroups[side]
  const tunnels = Group.useTunnels()
  if (Object.values(tunnels).filter(Boolean).length === 0) return <Group.Out />
  return (
    <div
      style={{
        // max: 320,
        // maxWidth: "40vw",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        ...style
      }}
    >
      <ResizablePanelGroup autoSaveId={`${side}-panel`} direction="vertical">
        <Group.Out />
      </ResizablePanelGroup>
    </div>
  )
}
