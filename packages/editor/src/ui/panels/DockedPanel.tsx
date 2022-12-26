import {
  Panel as ResizablePanel,
  PanelResizeHandle
} from "react-resizable-panels"
import { useEditor } from "../../editable"
import { PanelGhost } from "../../editable/Ghost"
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
            editor.uiPanels.send("DRAGGING", {
              panel: panel,
              event: {
                offset: e.offset,
                movement: e.movement,
                xy: e.xy,
                bounds: e._bounds
              }
            })
          }}
          onDragEnd={(e) => {
            editor.uiPanels.send("STOP_DRAGGING", {
              panel: panel,
              event: {
                offset: e.offset,
                movement: e.movement,
                bounds: e._bounds,
                xy: e.xy
              }
            })
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
