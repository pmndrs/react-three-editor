import {
  Panel as ResizablePanel,
  PanelResizeHandle
} from "react-resizable-panels"
import { LevaPanel, OurPanelProps } from "./LevaPanel"
import { LeftPanel, RightPanel } from "./panel-tunnels"
import { TitleWithFilter } from "./PanelTitle"

export function DockedPanel({
  title,
  side,
  panel,
  reveal,
  order = 0,
  width
}: OurPanelProps & { order?: number }) {
  let Group = side === "left" ? LeftPanel : RightPanel
  return (
    <Group.In>
      <ResizablePanel id={`${side}-${order}`} defaultSize={0.5} order={order}>
        <TitleWithFilter title={title} setFilter={() => {}} toggle={() => {}} />
        <div
          style={{
            height: `calc(100% - ${order === 0 ? "36" : "28"}px)`,

            overflow: "scroll",
            backgroundColor: "var(--leva-colors-elevation2)"
          }}
        >
          <LevaPanel
            panel={panel}
            title={title}
            side={side}
            width={width}
            collapsed={false}
            reveal={reveal}
          />
        </div>
        {order === 0 && (
          <PanelResizeHandle>
            <div className={"vertical-handle"} />
          </PanelResizeHandle>
        )}
      </ResizablePanel>
    </Group.In>
  )
}
