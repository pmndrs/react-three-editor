import { PlayerProps, PlayerRef } from "@remotion/player"
import { forwardRef, useContext } from "react"
import { PanelContext } from "react-resizable-panels"
import useResizeObserver from "use-resize-observer"
import { EditablePlayer } from "./EditablePlayer"
export const PlayerPanel = forwardRef<
  PlayerRef,
  PlayerProps<{}> & { component: React.FC }
>(function PlayerPanel(props, ref) {
  const panelSize = useContext(PanelContext)
  console.log(panelSize)
  const { ref: observerRef, width, height } = useResizeObserver()

  let playerWidth = (width ?? props.compositionWidth) - 10
  let playerHeight = (height ?? props.compositionHeight) - 10
  let shownheight =
    playerWidth * (props.compositionHeight / props.compositionWidth)
  if (shownheight > playerHeight - 10) {
    {
      playerWidth =
        playerHeight * (props.compositionWidth / props.compositionHeight)
    }
  }
  return (
    <div
      ref={observerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#CBD5E1"
      }}
    >
      <div
        style={{
          background: "white"
        }}
      >
        <EditablePlayer
          {...props}
          ref={ref}
          style={{
            width: playerWidth,
            aspectRatio: `1 / ${
              props.compositionHeight / props.compositionWidth
            }}`
          }}
        />
      </div>
    </div>
  )
})
