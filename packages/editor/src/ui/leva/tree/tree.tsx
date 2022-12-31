import { createPlugin, styled, useInputContext } from "leva/plugin"
import { EditableElement } from "../@editable-jsx/core"
import { TreeElement } from "./TreeElement"

const StyledWrapper = styled("div", {
  // borderTop: "1px solid $elevation1",
  // borderBottom: "1px solid $elevation1",
  padding: "$sm 0px",
  variants: {
    scrollable: {
      true: {
        maxHeight: 180,
        overflow: "auto",
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)"
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "$elevation3",
          borderRadius: "$lg"
        }
      },
      false: {}
    }
  }
})

type Settings = {
  items: { [key: string]: EditableElement }
  scrollable: boolean
}

export const tree = createPlugin<Settings, {}, Settings>({
  normalize({ items, scrollable }, path, data) {
    return { settings: { items, scrollable }, value: {} }
  },
  component() {
    const context = useInputContext<{ settings: Settings }>()
    return (
      <StyledWrapper scrollable={context.settings.scrollable}>
        {Object.values(context.settings.items).map((v) => (
          <TreeElement element={v} key={v.id} />
        ))}
      </StyledWrapper>
    )
  }
})
