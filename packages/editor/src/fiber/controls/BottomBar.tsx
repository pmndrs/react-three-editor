import { useEditor } from "@editable-jsx/core/useEditor"
import { Icon } from "@iconify/react"
import { useThree } from "@react-three/fiber"
import { styled } from "leva/plugin"
import {
  FloatingPanels,
  LeftPanel,
  RightPanel
} from "../../ui/panels/panel-tunnels"
import { In } from "../../ui/tunnel"

const StyledIcon = styled(Icon, {})

const StyledButtonGroupButton = styled("button", {
  $reset: "",
  cursor: "pointer",
  padding: "2px 12px",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  height: "100%",
  [`> ${StyledIcon}`]: {
    // marginRight: "$sm"
  },
  variants: {
    active: {
      true: {
        backgroundColor: "$accent2",
        color: "$folderTextColor",
        "&:hover": {
          backgroundColor: "$accent2"
        }
      },
      false: {
        "&:hover": {
          backgroundColor: "$elevation3"
        }
      }
    }
  }
})

const StyledBottomBar = styled("div", {
  position: "fixed",
  height: 40,
  background: "var(--leva-colors-elevation1)",
  backdropFilter: "blur(10px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0px 0px",
  color: "white",
  fontSize: 12,
  width: "fit-content",
  borderRadius: "$lg",
  boxShadow: "$level2",
  zIndex: 1000,
  variants: {
    side: {
      left: {},
      right: {},
      center: {
        transform: "translateX(-50%)"
      }
    },
    placement: {
      top: {
        top: 24
      },
      bottom: {
        bottom: 24
      }
    }
  },
  // last StyledButtonGroupButton child in stitches syntax,
  [`${StyledButtonGroupButton}:last-child`]: {
    borderTopRightRadius: "$lg",
    borderBottomRightRadius: "$lg"
  },

  [`${StyledButtonGroupButton}:first-child`]: {
    borderTopLeftRadius: "$lg",
    borderBottomLeftRadius: "$lg"
  } // hover state for StyledButtonGroupButton in stitches syntax
})

export function DynamicIsland(props: DynamicIslandProps) {
  return (
    <FloatingPanels.In>
      <FloatingBottomBar {...props} />
    </FloatingPanels.In>
  )
}

function FloatingBottomBar(props: DynamicIslandProps) {
  const size = useThree((s) => s.size)
  return (
    <In>
      <BottomBar size={size} {...props} />
    </In>
  )
}

type DynamicIslandProps = {
  size?: {
    width: number
    height: number
  }
  side?: "left" | "right" | "center" | string
  placement?: "top" | "bottom" | string
  hidden?: boolean
}

function BottomBar({
  size,
  side = "left",
  placement = "bottom",
  hidden = false
}: DynamicIslandProps) {
  const editor = useEditor()
  let mode = editor.useMode()

  const hasLeft =
    Object.values(LeftPanel.useTunnels()).filter(Boolean).length > 0
  const hasRight =
    Object.values(RightPanel.useTunnels()).filter(Boolean).length > 0

  const open = editor.commands.useStore((s) => s.open)

  if (hidden) {
    return null
  }

  return (
    <StyledBottomBar
      style={
        side !== "right"
          ? {
              left:
                (hasLeft ? (hasRight ? 300 : 360) : 0) +
                (side === "left" ? 24 : size.width / 2)
            }
          : {
              right:
                side === "right"
                  ? (hasRight ? (hasLeft ? 300 : 360) : 0) + 24
                  : undefined
            }
      }
      side={side}
      placement={placement}
    >
      <StyledButtonGroupButton
        onClick={() => editor.send("TOGGLE_MODE")}
        active={mode === "editing"}
      >
        <Icon icon="mdi:pencil" fontSize={16} />
      </StyledButtonGroupButton>
      <StyledButtonGroupButton
        active={open}
        onClick={() => editor.commands.toggleCommandBar()}
      >
        <Icon icon="ph:command-duotone" fontSize={16} />
      </StyledButtonGroupButton>
      <StyledButtonGroupButton
        onClick={() => editor.send("TOGGLE_MODE")}
        active={mode === "playing"}
      >
        <Icon icon="ph:play-fill" fontSize={16} />
      </StyledButtonGroupButton>
    </StyledBottomBar>
  )
}
