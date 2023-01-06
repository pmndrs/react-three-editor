import { RootState, _roots } from "@react-three/fiber"
import { UseBoundStore } from "zustand"
import { createStore } from "./createEditorStore"

export type Root = {
  fiber: any
  store: UseBoundStore<RootState>
}

export function createEditorRoot(key: HTMLDivElement, appRoot: Root) {
  if (_roots.has(key)) return

  const appState = appRoot.store.getState()
  const editorStore = createStore(appState.scene, appState.gl, appState.camera)

  editorStore.getState().set((state: RootState) => ({
    internal: { ...state.internal, active: true }
  }))

  const editorRoot: Root = {
    fiber: null,
    store: editorStore
  }

  _roots.set(key, editorRoot)

  return editorRoot
}
