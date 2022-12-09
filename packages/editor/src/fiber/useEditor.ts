import { useContext } from "react"
import { EqualityChecker, StateSelector } from "zustand"
import { EditorContext } from "./contexts"
import { EditorStoreStateType, EditorStoreType } from "./stores"

export const useEditor = <U>( selector: StateSelector<EditorStoreStateType, U>, equalityChecker?: EqualityChecker<U> ): U => {
    const useEditorStore = useContext( EditorContext )
    if ( !useEditorStore ) {
        throw new Error("useEditorStore must be used within a EditorProvider")
    }
    return useEditorStore( selector, equalityChecker )
}
