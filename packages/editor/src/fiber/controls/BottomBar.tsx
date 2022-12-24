import { Icon } from "@iconify/react"
import { styled } from "leva/plugin"
import shallow from "zustand/shallow"
import { In } from "../../editable/controls/Outs"
import { useEditor } from "../../editable/useEditor"

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
  bottom: 24,
  left: "50%",
  transform: "translateX(-50%)",
  right: 0,
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

export function BottomBar() {
  const editor = useEditor()
  let mode = editor.useMode()
  const [open, toggleOpen] = editor.useCommandStore(
    (s) => [s.open, s.toggleOpen],
    shallow
  )
  return (
    <In>
      <StyledBottomBar>
        <StyledButtonGroupButton
          onClick={() => editor.send("TOGGLE_MODE")}
          active={mode === "editing"}
        >
          <Icon icon="mdi:pencil" fontSize={16} />
        </StyledButtonGroupButton>
        <StyledButtonGroupButton active={open} onClick={() => toggleOpen()}>
          <Icon icon="ph:command-duotone" fontSize={16} />
        </StyledButtonGroupButton>
        <StyledButtonGroupButton
          onClick={() => editor.send("TOGGLE_MODE")}
          active={mode === "playing"}
        >
          <Icon icon="ph:play-fill" fontSize={16} />
        </StyledButtonGroupButton>
      </StyledBottomBar>
    </In>
  )
}
