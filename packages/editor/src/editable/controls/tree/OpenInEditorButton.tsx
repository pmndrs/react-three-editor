import { EditableElement } from "../../EditableElement"
import { StyledIcon } from "../folder/StyledFolder"

export function OpenInEditorButton({ element }: { element: EditableElement }) {
  return (
    <StyledIcon icon="pepicons-code" onClick={(e) => element.openInEditor()} />
  )
}
