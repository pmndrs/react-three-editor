import { EditPatch, JSXSource } from "../types"
import type { FC } from "react"
import { EditableElement } from "./EditableElement"
import create, { UseBoundStore, StoreApi } from "zustand"
import { StoreType } from "leva/dist/declarations/src/types"

export type EditorStoreState = {
  selectedId: null | string
  selectedKey: null | string
  elements: Record<string, EditableElement>
  settingsPanel: string | StoreType
}

const createEditorStore = () => {
  return create<EditorStoreState>()(() => {
    return {
      selectedId: null,
      selectedKey: null,
      elements: {
        root: new EditableElement("root", {} as any, "editor")
      },
      settingsPanel: "scene"
    }
  })
}

export class Editor extends EventTarget {
  store: UseBoundStore<StoreApi<EditorStoreState>>
  constructor(public client: { save: (data: EditPatch[]) => Promise<void> }) {
    super()
    this.store = createEditorStore()
  }
  createElement(
    id: string,
    source: JSXSource,
    componentType: string | FC,
    parentId?: string
  ) {
    return new EditableElement(id, source, componentType, parentId)
  }

  addElement(element: EditableElement, parentId?: string | null) {
    if (parentId) {
      this.store.setState((state) => {
        let parent = Object.assign(state.elements[parentId] ?? {}, {
          childIds: [...(state.elements[parentId]?.childIds ?? []), element.id]
        })

        const newElement = Object.assign(element, state.elements[element.id])
        newElement.index = `${parent.childIds.length - 1}`

        return {
          ...state,
          elements: {
            ...state.elements,
            [newElement.id]: newElement,
            [parentId]: parent
          }
        }
      })
    } else {
      this.store.setState((state) => {
        return {
          ...state,
          elements: {
            ...state.elements,
            [element.id]: Object.assign(element, state.elements[element.id])
          }
        }
      })
    }
  }

  removeElement(element: EditableElement, parentId: string | null) {
    if (parentId) {
      this.store.setState((state) => {
        const elements = { ...state.elements }
        if (elements[parentId]) {
          elements[parentId].childIds = elements[parentId]?.childIds.filter(
            (c) => c !== element.id
          )
        }

        delete elements[element.id]
        return {
          ...state,
          elements
        }
      })
    } else {
      this.store.setState((state) => {
        const newState = { ...state }
        delete newState.elements[element.id]
        return newState
      })
    }
  }
}
