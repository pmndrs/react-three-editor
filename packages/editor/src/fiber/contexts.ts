import { createContext } from "react"
import { CommandHistory } from "./command-manager"
import { EditorStoreType } from "./stores"

export const CommandHistoryContext = createContext<CommandHistory>( null! )
export const EditorContext = createContext<EditorStoreType | null>(null)
export const SceneElementContext = createContext<string | null>(null)
