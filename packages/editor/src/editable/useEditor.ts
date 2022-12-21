import { useContext } from "react"
import { Editor, EditorContext } from "./Editor"

export const useEditor = (): Editor => {
  const editor = useContext(EditorContext)
  if (!editor) {
    throw new Error("useEditor must be used within a EditorProvider")
  }
  return editor
}
