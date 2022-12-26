import { LevaRootProps } from "leva/dist/declarations/src/components/Leva/LevaRoot"
import { styled, useTransform } from "leva/plugin"
import { memo, useEffect } from "react"
import { DragGestureState, TitleWithFilter } from "./PanelTitle"

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

export const LevaCore = memo(
  ({
    children,
    oneLineLabels = false,
    titleBar = {
      title: undefined,
      drag: true,
      filter: true,
      position: undefined,
      onDrag: undefined,
      onDragStart: undefined,
      onDragEnd: undefined
    },
    collapsed,
    setCollapsed,
    hideCopyButton = false
  }: LevaRootProps & {
    children: React.ReactNode
    collpased?: boolean
    setCollapsed?: (flag: boolean) => void & {
      onDrag: (point: DragGestureState) => void
    }
  }) => {
    // drag
    const [rootRef, set] = useTransform<HTMLDivElement>()

    // this generally happens on first render because the store is initialized in useEffect.
    const title =
      typeof titleBar === "object" ? titleBar.title || undefined : undefined
    const drag = typeof titleBar === "object" ? titleBar.drag ?? true : true
    const filterEnabled =
      typeof titleBar === "object" ? titleBar.filter ?? true : true
    const position =
      typeof titleBar === "object" ? titleBar.position || undefined : undefined
    const onDrag =
      typeof titleBar === "object" ? titleBar.onDrag || undefined : undefined
    const onDragStart =
      typeof titleBar === "object"
        ? titleBar.onDragStart || undefined
        : undefined
    const onDragEnd =
      typeof titleBar === "object" ? titleBar.onDragEnd || undefined : undefined

    useEffect(() => {
      set({ x: position?.x, y: position?.y })
    }, [position, set])

    return (
      <StyledRoot
        ref={rootRef}
        fill={false}
        flat={false}
        hideTitleBar={!titleBar}
        style={{ display: "block" }}
      >
        {titleBar && (
          <TitleWithFilter
            onDrag={(point) => {
              set({ x: point.offset[0], y: point.offset[1] })
              onDrag?.(point)
            }}
            onDragStart={(point) => onDragStart?.(point)}
            onDragEnd={(point) => onDragEnd?.(point)}
            setFilter={() => {}}
            toggle={(flag?: boolean) => setCollapsed((t) => flag ?? !t)}
            toggled={!collapsed}
            title={title}
            drag={drag}
            filterEnabled={filterEnabled}
            from={position}
          />
        )}
        {children}
      </StyledRoot>
    )
  }
)
