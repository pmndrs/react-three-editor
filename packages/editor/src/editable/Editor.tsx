import { createEditorStore, EditorStoreType } from "./store"

export class Editor {
  store: EditorStoreType
  constructor(public plugins: any[]) {
    this.store = createEditorStore()
  }
  setRef(element: any, ref: any) {}
}
