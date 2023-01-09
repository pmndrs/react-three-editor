import { TreeItem } from "@editable-jsx/ui"
import { useContext } from "react"
import { EditableElement } from "../EditableElement"
import { ElementName } from "../ui/ElementName"
import { TreeContext } from "./tree"

export function TreeElement({ element }: { element: EditableElement }) {
  const selected = element.useIsSelected()
  const treeContext = useContext(TreeContext)
  const [collapsed, setCollapsed] = treeContext.useCollapsed(element)
  const dirty = element.useIsDirty()
  const children = treeContext.useChildren(element)
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
