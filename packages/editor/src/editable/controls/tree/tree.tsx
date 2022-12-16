import { createPlugin, styled, useInputContext } from "leva/plugin"
import { TreeElement } from "./TreeElement"

const StyledWrapper = styled("div", {
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
  items: object
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
          <TreeElement
            element={v}
            key={v.id}
            collapsed={false}
            onCollapse={() => {}}
            showChildren={true}
            panel={false}
          />
        ))}
      </StyledWrapper>
    )
  }
})
