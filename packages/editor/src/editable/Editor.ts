import { createContext } from "react"
import { EditableElement } from "./EditableElement"
import { useContext } from "react"
import { EqualityChecker, StateSelector } from "zustand"

import create from "zustand"

export type EditorStoreStateType = {
  selected: null | string
  elements: Record<string, EditableElement>
}

const createEditorStore = () => {
  return create<EditorStoreStateType>(() => ({
    selected: null,
    elements: {}
  }))
}

export type EditorStoreType = ReturnType<typeof createEditorStore>

type Diff = {
  value: {
    [x: string]: any
  }
  source: any
}

export class Editor {
  store: EditorStoreType

  constructor(
    public plugins: any[],
    public client: {
      save: (data: any) => Promise<void>
    }
  ) {
    this.store = createEditorStore()
  }

  setRef(element: any, ref: any) {}

  async saveDiff(diff: Diff) {
    await this.client.save(diff)
  }

  async save(diffs: Diff[]) {
    for (let diff of diffs) {
      await this.saveDiff(diff)
    }
  }

  select(element: EditableElement<any>): void {
    this.store.setState({
      selected: element.id
    })
  }

  clearSelection(): void {
    this.store.setState({
      selected: null
    })
  }

  addElement(element: EditableElement, parent: EditableElement | null) {}

  removeElement(element: EditableElement, parent: EditableElement | null) {}
}

export const EditorContext = createContext<Editor | null>(null)

export const useEditor = <U>(
  selector: StateSelector<EditorStoreStateType, U>,
  equalityChecker?: EqualityChecker<U>
): U => {
  const editor = useContext(EditorContext)
  if (!editor) {
    throw new Error("useEditor must be used within a EditorProvider")
  }
  return editor.store(selector, equalityChecker)
}
