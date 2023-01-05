import { createContext, useContext } from "react"
import { EditableElement } from "./EditableElement"

export const EditableContext = createContext<EditableElement | null>(null)

export function useEditableContext() {
  const editableElement = useContext(EditableContext)
  if (!editableElement) {
    throw new Error("useEditableContext must be used within an EditableElement")
  }
  return editableElement
}
