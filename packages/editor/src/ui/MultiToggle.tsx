import { Icon } from "@iconify/react"
import { styled, useInputContext } from "leva/plugin"

export const StyedIcon = styled(Icon, {})

export const StyledButtonGroupButton = styled("button", {
  $reset: "",
  cursor: "pointer",
  borderRadius: "$xs",
  padding: "2px $sm",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  [`> svg`]: {
    marginRight: "$sm"
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

export const StyledButtonGroup = styled("div", {
  $flex: "",
  justifyContent: "space-around",
  gap: "$colGap"
})

export const MultiToggle = () => {}
MultiToggle.Option = (props) => {
  const input = useInputContext<{ value: any; setValue: any }>()
  return (
    <StyledButtonGroupButton
      active={input.value === props.value}
      onClick={(e) => input.setValue(props.value)}
    >
      {props.children ?? props.value}
    </StyledButtonGroupButton>
  )
}

MultiToggle.Root = ({ children }) => {
  return <StyledButtonGroup>{children}</StyledButtonGroup>
}
