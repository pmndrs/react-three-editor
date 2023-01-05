import {
  EditableElement,
  ElementIcon,
  OpenInEditorButton
} from "@editable-jsx/editable"
import {
  Components,
  createPlugin,
  HoveredIcon,
  styled,
  useInputContext
} from "@editable-jsx/ui"

const StyledFolder = styled("div", {})
const StyledTitle = styled("div", {
  $flex: "",
  color: "$folderTextColor",
  userSelect: "none",
  // cursor: "pointer",
  padding: "var(--leva-tree-vertical-spacing) 0px",
  fontWeight: "medium",
  fontFamily: "$mono",
  fontSize: "var(--leva-fontSizes-root)",

  "> svg": {
    marginLeft: -4,
    marginRight: 4,
    fill: "$folderWidgetColor",
    opacity: 0.6
  },
  [`> ${HoveredIcon}`]: {
    opacity: 0
  },
  "&:hover > svg": {
    fill: "$folderWidgetColor"
  },

  [`${StyledFolder}:hover > & > svg`]: {
    opacity: 1
  },
  [`&:hover > ${HoveredIcon}`]: {
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

export function ElementRef({ element }: { element: EditableElement }) {
  const name = element.useName()

  return (
    <>
      <ElementIcon element={element} />
      <div
        style={{
          marginLeft: "4px",
          textOverflow: "ellipsis",
          overflow: "hidden",
          flex: 1
        }}
        onClick={(e) => {
          element.editor.select(element)
        }}
      >
        {name}
      </div>
      <div style={{ marginLeft: "auto" }} />
      <OpenInEditorButton element={element} />
    </>
  )
}

export const ref = createPlugin({
  component: () => {
    const context = useInputContext<{ value: EditableElement }>()

    if (!context.value) {
      return (
        <Components.Row input>
          <Components.Label>{context.key}</Components.Label>
          <StyledFolder>
            <StyledTitle>
              {/* <ElementRef element={context.value} key={context.value.id} /> */}
            </StyledTitle>
          </StyledFolder>
        </Components.Row>
      )
    }
    return (
      <Components.Row input>
        <Components.Label>{context.key}</Components.Label>
        <StyledFolder>
          <StyledTitle>
            <ElementRef element={context.value} key={context.value.id} />
          </StyledTitle>
        </StyledFolder>
      </Components.Row>
    )
  }
})
