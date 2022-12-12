import { EditorStoreType } from "./store"

export class Editor {
  constructor(public store: EditorStoreType, public plugins: any[]) {}
}
