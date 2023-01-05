import { HoveredIcon } from "@editable-jsx/ui"
import { EditableElement } from "../EditableElement"

export function OpenInEditorButton({ element }: { element: EditableElement }) {
  return (
    <HoveredIcon icon="pepicons-code" onClick={(e) => element.openInEditor()} />
  )
}
