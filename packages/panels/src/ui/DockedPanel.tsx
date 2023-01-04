import {
  Panel as ResizablePanel,
  PanelResizeHandle
} from "react-resizable-panels"
import { ControlsPanel } from "../../../ui-utils/dist/editable-jsx-ui.cjs"
import { usePanel } from "../usePanel"
import { usePanelManager } from "../usePanelManager"
import { PanelGhost } from "./PanelGhost"
import { TitleWithFilter } from "./PanelTitle"
import { LeftPanelGroup, RightPanelGroup } from "./tunnels"
import { PanelProps } from "./types"

export function DockedPanel({
  title,
  side,
  panel: id,
  lazy,
  order = 0,
  width
}: PanelProps & { order?: number }) {
  let PanelGroup = side === "left" ? LeftPanelGroup : RightPanelGroup
  const panelManager = usePanelManager()
  const panel = usePanel(id)
  return (
    <PanelGroup.In>
      <ResizablePanel id={`${side}-${order}`} defaultSize={0.5} order={order}>
        <PanelGhost panel={id} />
        <TitleWithFilter
          title={title}
          setFilter={() => {}}
          toggle={() => {}}
          drag
          filterEnabled={true}
          onDrag={(e) => {
            panelManager.send("DRAGGING", {
              panel: id,
              event: {
                offset: e.offset,
                movement: e.movement,
                xy: e.xy,
                bounds: e._bounds
              }
            })
          }}
          onDragEnd={(e) => {
            panelManager.send("STOP_DRAGGING", {
              panel: id,
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
          <ControlsPanel
            store={panel.store}
            title={title}
            side={side}
            width={width}
            collapsed={false}
            lazy={lazy}
          />
        </div>
        {order === 0 && (
          <PanelResizeHandle>
            <div className={"vertical-handle"} />
          </PanelResizeHandle>
        )}
      </ResizablePanel>
    </PanelGroup.In>
  )
}
