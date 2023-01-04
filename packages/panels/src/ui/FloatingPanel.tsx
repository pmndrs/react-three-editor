import { memo, useEffect } from "react"
import {
  ControlsPanel,
  DragState,
  Floating,
  styled,
  useTransform
} from "../../../ui-utils/dist/editable-jsx-ui.cjs"
import { usePanel } from "../usePanel"
import { usePanelManager } from "../usePanelManager"
import { TitleWithFilter } from "./PanelTitle"
import { LeftPanelGroup, RightPanelGroup } from "./tunnels"
import { PanelProps } from "./types"

export const StyledRoot = styled("div", {
  /* position */
  position: "relative",
  fontFamily: "$mono",
  fontSize: "$root",
  overflow: "hidden",
  color: "$rootText",
  backgroundColor: "$elevation1",
  variants: {
    fill: {
      false: {
        position: "fixed",
        top: "0px",
        left: "0px",
        zIndex: 1000,
        width: "$rootWidth"
      },
      true: {
        position: "relative",
        width: "100%"
      }
    },
    flat: {
      false: {
        borderRadius: "$lg",
        boxShadow: "$level1"
      }
    },
    hideTitleBar: {
      true: { $$titleBarHeight: "0px" },
      false: { $$titleBarHeight: "$sizes$titleBarHeight" }
    }
  },

  "&,*,*:after,*:before": {
    boxSizing: "border-box"
  },

  "*::selection": {
    backgroundColor: "$accent2"
  }
})

export const FloatingPanelRoot = memo(
  ({
    children,
    title,
    position,
    onDrag = undefined,
    onDragStart = undefined,
    onDragEnd = undefined,
    collapsed,
    setCollapsed
  }: {
    children: React.ReactNode
    collapsed?: boolean
    setCollapsed?: (flag: boolean) => void
    title?: string
    onDrag?: (point: DragState) => void
    onDragStart?: (point: DragState) => void
    onDragEnd?: (point: DragState) => void
    position?: { x: number; y: number }
  }) => {
    const [rootRef, set] = useTransform<HTMLDivElement>()

    // this generally happens on first render because the store is initialized in useEffect.
    useEffect(() => {
      set({ x: position?.x, y: position?.y })
    }, [position, set])

    return (
      <StyledRoot
        ref={rootRef}
        fill={false}
        flat={false}
        hideTitleBar={false}
        style={{ display: "block" }}
      >
        <TitleWithFilter
          onDrag={(point) => {
            set({ x: point.offset[0], y: point.offset[1] })
            onDrag?.(point)
          }}
          onDragStart={(point) => onDragStart?.(point)}
          onDragEnd={(point) => onDragEnd?.(point)}
          setFilter={() => {}}
          toggle={(flag?: boolean) => setCollapsed?.(flag ?? !collapsed)}
          toggled={!collapsed}
          title={title}
          drag={true}
          filterEnabled={true}
          from={position}
        />
        {children}
      </StyledRoot>
    )
  }
)

function usePanelPosition({
  panel: id,
  side,
  size,
  width
}: PanelProps & {
  size: { width: number }
  width: number
}) {
  const leftTunnel = LeftPanelGroup.useTunnels()
  const rightTunnel = RightPanelGroup.useTunnels()

  let hasLeft = Object.values(leftTunnel).filter(Boolean).length > 0
  let hasRight = Object.values(rightTunnel).filter(Boolean).length > 0
  const panel = usePanel(id)
  const panelManager = usePanelManager()

  let { position } = panel.useSettings({
    position: [
      side === "left"
        ? (hasLeft ? (hasRight ? 280 : 360) : 0) + 10
        : (hasLeft ? (hasRight ? 280 : 360) : 0) + size.width - width,
      10
    ]
  })

  const offset = panelManager.useState((s) =>
    !s.matches("idle") && s.event.panel === id ? s.event.event.movement : [0, 0]
  )

  return {
    x: position[0] + (offset[0] ?? 0),
    y: position[1] + (offset[1] ?? 0)
  }
}

export function FloatingControlsPanel(
  props: PanelProps & {
    size: { width?: number }
  }
) {
  const panelManager = usePanelManager()
  const position = usePanelPosition({ width: 320, ...props })
  const panel = usePanel(props.panel)

  return (
    <FloatingPanelRoot
      title={props.title}
      position={position}
      onDrag={(e) => {
        panelManager.send("DRAGGING", {
          panel: props.panel,
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
          panel: props.panel,
          event: {
            offset: e.offset,
            movement: e.movement,
            xy: e.xy,
            bounds: e._bounds
          }
        })
      }}
    >
      <div
        style={{
          width: `100%`,
          maxHeight: 500,
          overflow: "scroll"
        }}
      >
        <ControlsPanel
          {...props}
          width={320}
          collapsed={false}
          store={panel.store}
        />
      </div>
    </FloatingPanelRoot>
  )
}

export function FloatingPanel(
  props: PanelProps & { order?: number; lazy?: boolean }
) {
  // we use the ThreeCanvas tunnel, to get access to the threejs canvas size from the r3f
  // useThree hook (there are otherways to do this)
  return (
    <Floating>
      {(size) => <FloatingControlsPanel {...props} size={size} />}
    </Floating>
  )
}
