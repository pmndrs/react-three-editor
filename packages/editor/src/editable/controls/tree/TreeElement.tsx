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
  const selected = element.editor.store((s) => s.selectedId === element?.id)

  const [_collapsed, setCollapsed] = useState(collapsed)

  const [visible, setVisible] = useState(
    element.ref?.visible || (true as boolean)
  )

  const state = element.editor.store((state) => state.elements)

  const dirty = element.store.useStore(
    (s) => Object.keys(element.changes).length > 0
  )
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
            style={{ marginLeft: "4px" }}
            onClick={(e) => element.editor.select(element)}
          >
            {element.displayName}
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
          {element.children
            .filter((c) => c !== element.id && state[c])
            .map((c) => (
              <TreeElement
                element={state[c]}
                key={c}
                collapsed={false}
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
