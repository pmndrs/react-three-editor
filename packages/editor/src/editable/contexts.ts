import { createContext } from "react"
import { Editor } from "./Editor"
import { EditableElement } from "./EditableElement"

export const EditorContext = createContext<Editor | null>(null)
export const EditableElementContext = createContext<EditableElement | null>(
  null
)
