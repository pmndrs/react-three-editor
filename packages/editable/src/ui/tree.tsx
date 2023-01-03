import { Tree } from "@editable-jsx/ui"
import { createPlugin, useInputContext } from "leva/plugin"
import { EditableElement } from "../EditableElement"

type Settings = {
  root: EditableElement
  scrollable: boolean
  component: (props: { element: EditableElement }) => JSX.Element
}

export const tree = createPlugin<Settings, {}, Settings>({
  normalize({ root, scrollable, component }, path, data) {
    return { settings: { root, scrollable, component }, value: {} }
  },
  component() {
    const context = useInputContext<{ settings: Settings }>()
    if (!context.settings.root) return null
    return <ElementTree {...context.settings} />
  }
})

function ElementTree({ component: Component, scrollable, root }) {
  const children = root.useChildren()
  return (
    <Tree scrollable={scrollable}>
      {children.map((v) => (
        <Component element={v} key={v.id} />
      ))}
    </Tree>
  )
}
