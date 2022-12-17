import { createContext, useContext } from "react"
import { EqualityChecker, StateSelector } from "zustand"
import { EditableElement } from "./EditableElement"

import create from "zustand"
import { ThreeEditor } from "../fiber/ThreeEditor"
import { CommandManager } from "./CommandManager"

export type EditorStoreStateType = {
  selectedId: null | string
  selectedKey: null | string
  elements: Record<string, EditableElement>
}

const createEditorStore = () => {
  return create<EditorStoreStateType>(() => ({
    selectedId: null,
    selectedKey: null,
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

export class Editor extends EventTarget {
  store: EditorStoreType

  commandManager: CommandManager = new CommandManager()

  constructor(
    public plugins: any[],
    public client: {
      save: (data: any) => Promise<void>
    }
  ) {
    super()
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
      selectedId: element.id,
      selectedKey: element.key
    })
  }

  selectId(id: string): void {
    if (!id) {
      return
    }
    // let element = this.store.getState().elements[id]
    this.store.setState({
      selectedId: id
      // selectedKey: element.key
    })
  }

  clearSelection(): void {
    this.store.setState({
      selectedId: null,
      selectedKey: null
    })
  }

  getElementById(id: string): EditableElement {
    return this.store.getState().elements[id]
  }

  addElement(element: EditableElement, parentId: string | null) {
    if (parentId) {
      this?.store?.setState((el) => ({
        elements: {
          ...el.elements,
          [element.id]: Object.assign(element, el.elements[element.id]),
          [parentId]: Object.assign(el.elements[parentId] ?? {}, {
            childIds: [...(el.elements[parentId]?.childIds ?? []), element.id]
          })
        }
      }))
    } else {
      this?.store?.setState((el) => ({
        elements: {
          ...el.elements,
          [element.id]: Object.assign(element, el.elements[element.id])
        }
      }))
    }
  }

  removeElement(element: EditableElement, parentId: string | null) {
    if (parentId) {
      this?.store?.setState((el) => {
        let e = {
          ...el.elements
        }

        if (e[parentId]) {
          e[parentId].childIds = e[parentId]?.childIds.filter(
            (c: string) => c !== element.id
          )
        }

        delete e[element.id]
        return { elements: e }
      })
    } else {
      this?.store?.setState((el) => {
        let e = { ...el }
        delete e.elements[element.id]
        return e
      })
    }
  }
}

export const EditorContext = createContext<Editor | null>(null)

export const useEditorStore = <U>(
  selector: StateSelector<EditorStoreStateType, U>,
  equalityChecker?: EqualityChecker<U>
): U => {
  const editor = useContext(EditorContext)
  if (!editor) {
    throw new Error("useEditor must be used within a EditorProvider")
  }
  return editor.store(selector, equalityChecker)
}

export const useEditor = (): ThreeEditor => {
  const editor = useContext(EditorContext)
  if (!editor) {
    throw new Error("useEditor must be used within a EditorProvider")
  }
  return editor as ThreeEditor
}
