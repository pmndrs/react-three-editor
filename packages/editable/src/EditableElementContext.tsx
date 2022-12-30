import { createContext, useContext } from "react"
import { EditableElement } from "./EditableElement"

export const EditableElementContext = createContext<EditableElement | null>(
  null
)

export function useEditableContext() {
  const editableElement = useContext(EditableElementContext)
  if (!editableElement) {
    throw new Error("useEditableContext must be used within an EditableElement")
  }
  return editableElement
}
