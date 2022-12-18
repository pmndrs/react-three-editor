import { Components, InputOptions, styled } from "leva/plugin"

import { custom } from "./custom"

export const StyledButtonGroupButton = styled("button", {
  $reset: "",
  cursor: "pointer",
  borderRadius: "$xs",
  padding: "2px $sm",
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
  justifyContent: "space-between",
  gap: "$colGap"
})

export function helpers(props: InputOptions) {
  return custom({
    ...props,
    data: "selected",
    component: (input) => {
      return (
        <Components.Row input>
          <Components.Label>{input.label}</Components.Label>
          <StyledButtonGroup>
            <StyledButtonGroupButton
              active={input.value === "all"}
              onClick={(e) => input.setValue("all")}
            >
              all
            </StyledButtonGroupButton>
            <StyledButtonGroupButton
              active={input.value === "selected"}
              onClick={(e) => input.setValue("selected")}
            >
              selected
            </StyledButtonGroupButton>
            <StyledButtonGroupButton
              active={input.value === "none"}
              onClick={(e) => input.setValue("none")}
            >
              none
            </StyledButtonGroupButton>
          </StyledButtonGroup>
        </Components.Row>
      )
    }
  })
}
