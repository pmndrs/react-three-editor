import { createContext, useContext } from "react"
import { Editable } from "./Editable"

export const EditableContext = createContext<Editable | null>(null)

export function useEditableContext() {
  const editableElement = useContext(EditableContext)
  if (!editableElement) {
    throw new Error("useEditableContext must be used within an EditableElement")
  }
  return editableElement
}
