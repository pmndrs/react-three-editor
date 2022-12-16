import { createPlugin, useInputContext } from "leva/plugin"
import { EditableElement } from "../../EditableElement"
import { TreeElement } from "./TreeElement"

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

    function setCollapsed() {
      context.setSettings({
        collapsed: !context.settings.collapsed
      })
    }

    return (
      <TreeElement
        element={context.value.element}
        key={context.value.element.id}
        collapsed={context.settings.collapsed}
        onCollapse={setCollapsed}
        showChildren={false}
        panel={true}
      />
    )
  }
})
