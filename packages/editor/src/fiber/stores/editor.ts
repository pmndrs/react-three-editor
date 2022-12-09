import create from "zustand"
import { EditableElement } from "../index"

export type EditorStoreStateType = {
    elements: Record<string, EditableElement>
}

export const createEditorStore = ( ) => {
    return create<EditorStoreStateType>( ( ) => ({
        elements: {}
    }) )
}

export type EditorStoreType = ReturnType<typeof createEditorStore>
