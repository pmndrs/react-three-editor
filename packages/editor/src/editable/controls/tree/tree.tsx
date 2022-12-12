import React from "react"
import { TreeElement as TreeElement } from "./TreeElement"
import { createPlugin, useInputContext } from "leva/plugin"

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
      <div style={{ maxHeight: 280, overflow: "scroll" }}>
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
      </div>
    )
  }
})
