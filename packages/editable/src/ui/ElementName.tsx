import { HoveredIcon, Icon } from "@editable-jsx/ui"
import { EditableElement } from "../EditableElement"
import { ElementIcon } from "./ElementIcon"
import { OpenInEditorButton } from "./OpenInEditorButton"

export function ElementName({
  element,
  dirty,
  visible,
  setVisible
}: {
  element: EditableElement<any>
  dirty?: boolean | undefined
  visible?: boolean
  setVisible?: (v: boolean) => void
}) {
  const name = element.useName()

  return (
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
          element.editor.select(element)
        }}
      >
        {name + " " + (dirty ? "*" : "")}
      </div>
      <div style={{ marginLeft: "auto" }} />
      <OpenInEditorButton element={element} />
      <HoveredIcon
        icon={visible ? "ph:eye-bold" : "ph:eye-closed-bold"}
        style={{
          marginLeft: 2
        }}
        onClick={(e) => (setVisible?.(!visible), (element.visible = !visible))}
      />
      <div style={{ marginLeft: 4 }} />
      {dirty ? (
        <Icon icon="material-symbols:save" onClick={(e) => element.save()} />
      ) : null}
    </>
  )
}
