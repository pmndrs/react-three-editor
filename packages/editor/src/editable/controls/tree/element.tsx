import { EditableElement } from "../../EditableElement"
import { createPlugin, useInputContext } from "leva/plugin"
import React from "react"
import { TreeElement } from "./TreeElement"

export const element = createPlugin({
  normalize(input: {
    entity: EditableElement
    collapsed?: boolean
    children?: boolean
    dirty?: boolean
    panel?: boolean
  }) {
    return {
      value: { entity: input.entity },
      settings: {
        collapsed: false,
        ...input
      }
    }
  },
  component: (props) => {
    const context = useInputContext<{
      value: { entity: EditableElement }
      settings: {
        collapsed: boolean
        children: boolean
        dirty: boolean
        panel: boolean
      }
    }>()

    function setCollapsed() {
      context.setSettings({
        collapsed: !context.settings.collapsed
      })
    }

    return (
      <TreeElement
        element={context.value.entity}
        key={context.value.entity.id}
        collapsed={context.settings.collapsed}
        onCollapse={setCollapsed}
        showChildren={false}
        panel={true}
      />
    )
  }
})
