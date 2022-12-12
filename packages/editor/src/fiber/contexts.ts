import { createContext } from "react"
import { EditableElement } from "./editable-element"
import { EditorStoreType } from "./stores"

export const EditorContext = createContext<EditorStoreType | null>(null)
export const SceneElementContext = createContext<EditableElement | null>(null)
