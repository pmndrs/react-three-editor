import { createContext } from "react"
import { Editor } from "./Editor"

export const EditorContext = createContext<Editor | null>(null)
