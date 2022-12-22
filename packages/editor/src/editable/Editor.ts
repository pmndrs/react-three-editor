import { levaStore } from "leva"
import { StoreType } from "leva/dist/declarations/src/types"
import type { FC } from "react"
import create, { StoreApi, UseBoundStore } from "zustand"
import { devtools } from "zustand/middleware"
import { CommandStoreState, createCommandBarStore } from "../commandbar"
import { CommandType } from "../commandbar/types"
import { EditPatch, JSXSource } from "../types"
import { EditableElement } from "./EditableElement"

export type EditorStoreState = {
  selectedId: string | null
  selectedKey: string | null
  elements: Record<string, EditableElement>
  settingsPanel: string | StoreType
}

const createEditorStore = (name?: string) => {
  return create<EditorStoreState>()(
    devtools(
      (_) => {
        return {
          selectedId: null,
          selectedKey: null,
          elements: {
            root: new EditableElement("root", {} as any, "editor")
          },
          settingsPanel: "scene"
        }
      },
      { name }
    )
  )
}

const createLevaStore = () =>
  new (Object.getPrototypeOf(levaStore).constructor)()

type PanelData = StoreType & { store: StoreType }
export type PanelStoreState = {
  panels: Record<string, { panel: PanelData }>
}
const createPanelStore = (name?: string) => {
  return create<PanelStoreState>()(
    devtools(
      (set) => {
        return {
          panels: {
            default: {
              panel: levaStore as PanelData
            }
          }
        }
      },
      {
        name
      }
    )
  )
}

export class Editor extends EventTarget {
  store: UseBoundStore<StoreApi<EditorStoreState>>
  commandStore: UseBoundStore<StoreApi<CommandStoreState>>
  panelStore: UseBoundStore<StoreApi<PanelStoreState>>
  constructor(public client: { save: (data: EditPatch[]) => Promise<void> }) {
    super()
    this.store = createEditorStore(`editor`)
    this.commandStore = createCommandBarStore(`editor:command`)
    this.panelStore = createPanelStore(`editor:panels`)
  }

  isEditorMode() {
    return false
  }

  getPanel(id: string | StoreType) {
    const panels = this.panelStore.getState().panels
    if (typeof id === "string") {
      if (panels[id]) return panels[id].panel

      panels[id] = { panel: createLevaStore() }

      panels[id].panel.store = panels[id].panel

      this.panelStore.setState({ panels })
      return panels[id].panel
    } else {
      return id as PanelData
    }
  }

  createElement(
    id: string,
    source: JSXSource,
    componentType: string | FC,
    parentId?: string
  ) {
    const element = new EditableElement(id, source, componentType, parentId)
    element.editor = this
    return element
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

  addEditable() {
    //
  }

  removeEditable() {
    //
  }

  toggleCommandBar(flag?: boolean) {
    this.commandStore.setState((state) => {
      return {
        ...state,
        open: typeof flag === "boolean" ? flag : !state.open
      }
    })
  }

  registerCommands(commands: CommandType[]) {
    this.commandStore.setState((state) => {
      return {
        ...state,
        commands: [...state.commands, ...commands]
      }
    })
  }

  unregisterCommands(commands: CommandType[]) {
    this.commandStore.setState((state) => {
      return {
        ...state,
        commands: state.commands.filter((c) => commands.some((tc) => tc === c))
      }
    })
  }

  openCommandGroup(name: string) {
    this.commandStore.setState((state) => {
      return {
        ...state,
        filter: "",
        activeCommandChain: [...state.activeCommandChain, name]
      }
    })
  }

  closeCommandGroup(name?: string) {
    this.commandStore.setState((state) => {
      let activeCommandChain = [...state.activeCommandChain]
      if (name) {
        const index = activeCommandChain.indexOf(name)
        if (index > -1) {
          activeCommandChain = activeCommandChain.splice(
            index,
            activeCommandChain.length
          )
        }
      } else {
        activeCommandChain.pop()
      }

      return {
        ...state,
        filter: "",
        activeCommandChain
      }
    })
  }
}
