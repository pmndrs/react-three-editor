import { TreeItem } from "../../../ui-utils/dist/editable-jsx-ui.cjs"
import { EditableElement } from "../EditableElement"
import { ElementName } from "../ui/ElementName"

export function TreeElement({ element }: { element: EditableElement }) {
  const selected = element.useIsSelected()
  const [collapsed, setCollapsed] = element.useCollapsed()
  const dirty = element.useIsDirty()
  const children = element.useChildren()
  const [visible, setVisible] = element.useVisible()

  let collapsible = children.length ? true : false

  return (
    <TreeItem
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      visible={visible}
      selected={selected}
      collapsible={collapsible}
      dirty={dirty}
      title={
        <ElementName
          dirty={dirty}
          element={element}
          visible={visible}
          setVisible={setVisible}
        />
      }
    >
      {!collapsed && (
        <div
          style={{
            marginLeft: "2px",
            marginTop: "2px"
          }}
        >
          {children.map((child) => (
            <TreeElement element={child} key={child.id} />
          ))}
        </div>
      )}
    </TreeItem>
  )
}
