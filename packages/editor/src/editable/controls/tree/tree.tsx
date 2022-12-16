import { createPlugin, styled, useInputContext } from "leva/plugin"
import { TreeElement } from "./TreeElement"

const StyledWrapper = styled("div", {
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
})

export const tree = createPlugin<
  { items: object },
  {},
  {
    items: object
  }
>({
  normalize({ items }, path, data) {
    return { settings: { items }, value: {} }
  },
  component() {
    const context = useInputContext<{ settings: { items: object } }>()
    return (
      <StyledWrapper>
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
