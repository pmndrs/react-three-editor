import {
  Panel as ResizablePanel,
  PanelResizeHandle
} from "react-resizable-panels"
import { useEditor } from "../../editable"
import { PanelGhost } from "../../editable/Ghost"
import { LevaPanel, OurPanelProps } from "./LevaPanel"
import { LeftPanel, RightPanel } from "./panel-tunnels"
import { panelService } from "./panelService"
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
  const editor = useEditor()
  return (
    <Group.In>
      <ResizablePanel id={`${side}-${order}`} defaultSize={0.5} order={order}>
        <PanelGhost panel={panel} />
        <TitleWithFilter
          title={title}
          setFilter={() => {}}
          toggle={() => {}}
          drag
          onDrag={(e) => {
            panelService.send("DRAGGING", {
              e
            })
          }}
          onDragStart={() => {
            panelService.send("START_DRAGGING", {
              panelId: panel
            })
          }}
          onDragEnd={({ xy, bounds }) => {
            panelService.send("STOP_DRAGGING", {
              panel: panel
            })

            console.log(bounds)
            if (xy[0] < 200) {
              editor.setSetting("panels." + panel + ".side", "left")
            } else if (xy[0] > window.innerWidth - 200) {
              editor.setSetting("panels." + panel + ".side", "right")
            }
          }}
        />
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
