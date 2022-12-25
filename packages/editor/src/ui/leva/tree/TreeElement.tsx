import { EditableElement } from "../../../editable"
import { ElementName } from "../../ElementName"
import { TreeItem } from "./TreeItem"

export function TreeElement({ element }: { element: EditableElement }) {
  const selected = element.useIsSelected()
  const [_collapsed, setCollapsed] = element.useCollapsed()
  const dirty = element.useIsDirty()
  const children = element.useChildren()
  const [visible, setVisible] = element.useVisible()

  let collapsible = children.length ? true : false

  return (
    <TreeItem
      collapsed={_collapsed}
      setCollapsed={(c) => {
        setCollapsed(c)
      }}
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
      {!_collapsed && (
        <div
          style={{
            marginLeft: "2px",
            marginTop: "2px"
          }}
        >
          {children.map((c) => (
            <TreeElement element={c} key={c.id} />
          ))}
        </div>
      )}
    </TreeItem>
  )
}
