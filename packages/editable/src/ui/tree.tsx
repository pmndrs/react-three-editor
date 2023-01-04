import {
  createPlugin,
  Tree,
  useInputContext
} from "../../../ui-utils/dist/editable-jsx-ui.cjs"
import { EditableElement } from "../EditableElement"

type TreeProps = {
  root: EditableElement
  scrollable: boolean
  component: (props: { element: EditableElement }) => JSX.Element
}

export const tree = createPlugin<TreeProps, {}, TreeProps>({
  normalize({ root, scrollable, component }, path, data) {
    return { settings: { root, scrollable, component }, value: {} }
  },
  component() {
    const context = useInputContext<{ settings: TreeProps }>()
    if (!context.settings.root) return null
    return <ElementTree {...context.settings} />
  }
})

function ElementTree({
  component: TreeItemComponent,
  scrollable,
  root
}: TreeProps) {
  const children = root.useChildren()
  return (
    <Tree scrollable={scrollable}>
      {children.map((child) => (
        <TreeItemComponent element={child} key={child.id} />
      ))}
    </Tree>
  )
}
