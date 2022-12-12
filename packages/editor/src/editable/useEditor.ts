import { useContext } from "react"
import { EqualityChecker, StateSelector } from "zustand"
import { EditorContext } from "./contexts"
import { EditorStoreStateType } from "./store"

export const useEditor = <U>(
  selector: StateSelector<EditorStoreStateType, U>,
  equalityChecker?: EqualityChecker<U>
): U => {
  const editor = useContext(EditorContext)
  if (!editor) {
    throw new Error("useEditor must be used within a EditorProvider")
  }
  return editor.store(selector, equalityChecker)
}
