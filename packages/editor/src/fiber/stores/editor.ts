import create from "zustand"
import { EditableElement } from "../index"

export type EditorStoreStateType = {
    selected: null | EditableElement
    elements: Record<string, EditableElement>
}

export const createEditorStore = ( ) => {
    return create<EditorStoreStateType>( ( ) => ({
        selected: null,
        elements: {}
    }) )
}

export type EditorStoreType = ReturnType<typeof createEditorStore>
