import { createContext, useContext } from "react"
import { EqualityChecker, StateSelector } from "zustand"
import { EditableElement } from "./EditableElement"

import { StoreType } from "leva/dist/declarations/src/types"
import create from "zustand"
import { ThreeEditor } from "../fiber/ThreeEditor"
import { CommandManager } from "./CommandManager"

export type EditorStoreStateType = {
  selectedId: null | string
  selectedKey: null | string
  elements: Record<string, EditableElement>
  settingsPanel: string | StoreType
}

const createEditorStore = () => {
  return create<EditorStoreStateType>(() => ({
    selectedId: null,
    selectedKey: null,
    elements: {
      root: new EditableElement("root", {} as any, "editor", null)
    },
    settingsPanel: "scene"
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
  expanded: Set<string>

  constructor(
    public plugins: any[],
    public client: {
      save: (data: any) => Promise<void>
    }
  ) {
    super()
    this.store = createEditorStore()
    this.root.editor = this as any
    this.root.index = ""
    this.expanded = localStorage.getItem("collapased")
      ? new Set(JSON.parse(localStorage.getItem("collapased")!))
      : new Set()
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

  async insertElement(params: any) {
    await this.client.save({
      ...params,
      action_type: "insertElement"
    })
  }

  get root() {
    return this.store.getState().elements.root
  }

  get selection() {
    return {
      selectedId: this.store.getState().selectedId,
      selectedKey: this.store.getState().selectedKey
    }
  }

  get selectedElement() {
    if (this.store.getState().selectedId) {
      return this.getElementById(this.store.getState().selectedId!)
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
      this?.store?.setState((el) => {
        let parent = Object.assign(el.elements[parentId] ?? {}, {
          childIds: [...(el.elements[parentId]?.childIds ?? []), element.id]
        })

        let newLement = Object.assign(element, el.elements[element.id])
        newLement.index = `${parent.childIds.length - 1}`
        return {
          elements: {
            ...el.elements,
            [newLement.id]: newLement,
            [parentId]: parent
          }
        }
      })
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
