import { HoveredIcon } from "../../../ui-utils/dist/editable-jsx-ui.cjs"
import { EditableElement } from "../EditableElement"

export function OpenInEditorButton({ element }: { element: EditableElement }) {
  return (
    <HoveredIcon icon="pepicons-code" onClick={(e) => element.openInEditor()} />
  )
}
