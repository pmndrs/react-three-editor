import { useContext } from "react"
import { EditableRoot, EditableRootContext } from "./EditableRoot"
import type { Editor } from "./Editor"
import { EditorContext } from "./EditorContext"

export const useEditor = <T extends Editor>(): T => {
  const editor = useContext(EditorContext)
  if (!editor) {
    throw new Error("useEditor must be used within a EditorProvider")
  }
  return editor as T
}

export const useEditableRoot = <T extends EditableRoot>(): T => {
  const root = useContext(EditableRootContext)
  if (!root) {
    throw new Error("useEditableRoot must be used within a EditableRoot")
  }
  return root as T
}
