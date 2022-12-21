import { Icon } from "@iconify/react"
import { LevaPanel } from "leva"
import { useState } from "react"
import { EditableElement } from "../../EditableElement"
import { StyledIcon } from "../folder/StyledFolder"
import { ElementIcon } from "./ElementIcon"
import { OpenInEditorButton } from "./OpenInEditorButton"
import { TreeItem } from "./TreeItem"

export function TreeElement({
  collapsed = false,
  onCollapse,
  element,
  showChildren = false,
  panel = false
}: {
  collapsed: boolean
  onCollapse?: (c: boolean) => void
  element: EditableElement
  showChildren?: boolean
  panel?: boolean
  collapsible?: boolean
}) {
  const selected = element.editor.store(
    (s) => s.selectedId === element?.id || s.selectedKey === element?.key
  )

  const [_collapsed, setCollapsed] = panel
    ? useState(false)
    : element.useCollapsed()

  const [visible, setVisible] = element.useVisible()

  // const [visible, setVisible] = useState(
  //   element.ref?.visible || (true as boolean)
  // )

  const dirty = element.store.useStore(
    (s) => Object.keys(element.changes).length > 0
  )

  const name = element.store?.useStore((s) => s.data["name"].value)

  return (
    <TreeItem
      collapsed={_collapsed}
      setCollapsed={(c) => {
        onCollapse?.(c)
        setCollapsed(c)
      }}
      visible={visible}
      selected={selected}
      collapsible={
        panel
          ? true
          : !showChildren
          ? false
          : element.children.length
          ? true
          : false
      }
      remeasure={panel}
      dirty={dirty}
      title={
        <>
          <ElementIcon element={element} />
          <div
            style={{
              marginLeft: "4px",
              textOverflow: "ellipsis",
              overflow: "hidden",
              flex: 1
            }}
            onClick={(e) => {
              let selected = element.editor.isSelected(element)
              if (selected) {
                setCollapsed((c) => !c)
              } else {
                element.editor.select(element)
                // setCollapsed(false)
              }
            }}
          >
            {name}
            {dirty ? "*" : ""}
          </div>
          <div style={{ marginLeft: "auto" }} />
          <OpenInEditorButton element={element} />
          <StyledIcon
            icon={visible ? "ph:eye-bold" : "ph:eye-closed-bold"}
            style={{
              marginLeft: 2
            }}
            onClick={(e) => (
              setVisible((v: boolean) => !v),
              (element.visible = !element.visible)
            )}
          />
          <div style={{ marginLeft: 4 }} />
          {dirty ? (
            <Icon
              icon="material-symbols:save"
              onClick={(e) => element.save()}
            />
          ) : null}
        </>
      }
    >
      {!_collapsed && showChildren && (
        <div
          style={{
            marginLeft: "2px",
            marginTop: "2px"
          }}
        >
          {element.children.map((c) => (
            <TreeElement
              element={c}
              key={c.id}
              collapsed={c.isPrimitive()}
              showChildren
            />
          ))}
        </div>
      )}
      {panel && (
        <LevaPanel
          fill
          titleBar={false}
          flat
          hideCopyButton
          theme={{
            space: {
              rowGap: "2px",
              // md: "6px",
              sm: "4px"
            }
          }}
          store={element.store}
        />
      )}
    </TreeItem>
  )
}
