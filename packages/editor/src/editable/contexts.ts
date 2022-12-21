import { createContext, useContext } from "react"
import { EditableElement } from "./EditableElement"
import { Editor } from "./Editor"

export const EditableElementContext = createContext<EditableElement | null>(
  null
)
export const EditorContext = createContext<Editor | null>(null)

export const useEditableElement = () => {
  const element = useContext(EditableElementContext)
  if (!element) {
    throw new Error(
      `useEditableElement should be used within EditableElementContext`
    )
  }
  return element
}

export const useEditor = () => {
  const editor = useContext(EditorContext)
  if (!editor) {
    throw new Error(`useEditor should be used within EditorContextProvider`)
  }
  return editor
}
