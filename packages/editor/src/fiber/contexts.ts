import { createContext } from "react"
import { EditorStoreType } from "./stores"

export const EditorContext = createContext<EditorStoreType | null>(null)
export const SceneElementContext = createContext<string | null>(null)
