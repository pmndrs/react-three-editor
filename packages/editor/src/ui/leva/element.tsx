import { EditableElement } from "@editable-jsx/core"
import { LevaPanel } from "leva"
import { createPlugin, styled, useInputContext } from "leva/plugin"
import { ElementName } from "../ElementName"
import { StyledIcon } from "../folder/StyledFolder"

export const StyledTitle = styled("div", {
  $flex: "",
  color: "$folderTextColor",
  userSelect: "none",
  cursor: "pointer",
  height: "20px",
  fontWeight: "$folder",
  fontSize: "small",
  paddingLeft: "$md",
  paddingTop: "16px",
  paddingBottom: "16px",

  "> svg": {
    marginLeft: -4,
    marginRight: 4,
    cursor: "pointer",
    fill: "$folderWidgetColor",
    opacity: 0.6
  },
  [`> ${StyledIcon}`]: {
    opacity: 0
  },
  "&:hover > svg": {
    fill: "$folderWidgetColor",
    opacity: 1
  },
  [`&:hover > & > ${StyledIcon}`]: {
    opacity: 1
  },
  variants: {
    selected: {
      true: {
        color: "$accent2",
        "> svg": {
          fill: "$folderWidgetColor"
        }
      },
      false: {}
    },
    visible: {
      false: {
        opacity: 0.2
      },
      true: {}
    }
  }
})

export const element = createPlugin({
  normalize(input: {
    element: EditableElement
    collapsed?: boolean
    children?: boolean
    dirty?: boolean
    panel?: boolean
  }) {
    return {
      value: { element: input.element },
      settings: {
        collapsed: false,
        ...input
      }
    }
  },
  component: (props) => {
    const context = useInputContext<{
      value: { element: EditableElement }
      settings: {
        collapsed: boolean
        children: boolean
        dirty: boolean
        panel: boolean
      }
    }>()

    return (
      <div>
        <StyledTitle>
          <ElementName element={context.value.element} />
        </StyledTitle>
        <LevaPanel
          fill
          titleBar={false}
          flat
          hideCopyButton
          theme={{
            space: {
              // rowGap: "2px",
              // md: "6px",
              sm: "4px"
            }
          }}
          store={context.value.element.store}
        />{" "}
      </div>
    )
  }
})
