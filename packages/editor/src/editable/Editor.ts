import { createContext, useContext, useEffect, useId, useMemo } from "react"
import { EqualityChecker, StateSelector } from "zustand"
import { EditableElement } from "./EditableElement"

import { levaStore, useControls } from "leva"
import {
  Schema,
  SchemaToValues,
  StoreType
} from "leva/dist/declarations/src/types"
import create from "zustand"
import { CommandManager } from "./CommandManager"
import { createLevaStore } from "./controls/createStore"
import { Panel, usePanel } from "./controls/Panel"
import {
  SchemaOrFn,
  usePersistedControls
} from "./controls/usePersistedControls"
import { EditableElementContext } from "./editable"

type Panel = StoreType & { store: StoreType }

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
  action_type: string
  value: {
    [x: string]: any
  }
  source: any
}

export class Editor<
  T extends EditableElement = EditableElement
> extends EventTarget {
  setSettings(values: any) {
    this.getPanel(this.settingsPanel).useStore.setState(({ data }) => {
      for (let key in values) {
        data[`world.` + data["world.mode"].value + ` settings.` + key].value =
          values[key]
      }
      return { data }
    })
  }

  hideAllPanels() {
    this.setSettings(
      Object.fromEntries(
        Object.keys(this.panels).map((panel) => [
          `panels.` + panel + ".hidden",
          true
        ])
      )
    )
  }

  showAllPanels() {
    this.setSettings(
      Object.fromEntries(
        Object.keys(this.panels).map((panel) => [
          `panels.` + panel + ".hidden",
          false
        ])
      )
    )
  }

  getEditableElement(el: any): T | null {
    throw new Error("Method not implemented.")
  }
  elementConstructor = EditableElement

  useElement(Component: any, props: any, forwardRef?: any): [T, any] {
    const id = useId()

    const editableElement = useMemo(() => {
      return this.createElement(id, props.source, Component, props)
    }, [id])

    // attaches the render, remount functions and returns a key that
    // need to be passed to the React element to cause remounts
    const { key, ref } = editableElement.useRenderKey(forwardRef)

    // update the element with the latest props and source
    editableElement.update(props._source, props)

    const parentId = useContext(EditableElementContext)?.id!

    useEffect(() => {
      this.addElement(editableElement, parentId)
      return () => {
        this.removeElement(editableElement, parentId)
      }
    }, [parentId, editableElement])

    return [
      editableElement,
      {
        ...props,
        ...editableElement.props,
        key,
        ref: forwardRef ? ref : undefined
      }
    ]
  }

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

  async deleteElement(params: any) {
    this.clearSelection()
    await this.client.save({
      ...params,
      action_type: "deleteElement"
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

    if (element?.isObject3D() || element.bounds) {
      this.bounds.refresh(element.bounds ?? element?.getObject3D()).fit()
    }
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
      element.parentId = parentId
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

  // setMode(value: any) {
  //   this.setSetting("mode", value)
  // }

  removeElement(element: EditableElement, parentId: string | null) {
    if (parentId) {
      element.parentId = null
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

  getSettings(arg0: string): number[] | ArrayLike<number> {
    let panel = this.getPanel(this.settingsPanel)
    return (
      panel.getData()[
        `world.` + panel.get("world.mode") + " settings." + arg0
      ] as any
    ).value as any
  }
  useMode<K extends string | undefined>(
    name?: K
  ): K extends undefined ? string : boolean {
    return this.getPanel(this.settingsPanel).useStore((s) =>
      name ? s.data["world.mode"]?.value === name : s.data["world.mode"]?.value
    ) as any
  }
  isSelected(arg0: EditableElement) {
    return this.store.getState().selectedId === arg0.id
  }

  panelStore = create((get, set) => ({
    panels: {
      default: {
        panel: levaStore as Panel
      }
    } as Record<string, { panel: Panel }>
  }))

  get panels() {
    return this.panelStore.getState().panels
  }

  useSetting(key: string, def) {
    return this.getPanel(this.settingsPanel).useStore(
      (s) => s.data[`settings.` + key]?.value ?? def
    )
  }

  getPanel(name: string | StoreType): Panel {
    let panels = this.panels
    if (typeof name === "string") {
      if (panels[name]) return panels[name].panel

      panels[name] = { panel: createLevaStore() }

      // @ts-ignore
      panels[name].panel.store = panels[name].panel

      this.panelStore.setState(() => ({
        panels
      }))
      return panels[name].panel
    } else {
      return name as Panel
    }
  }

  settings = createLevaStore()

  get settingsPanel(): StoreType | string {
    return this.store.getState().settingsPanel
  }

  set settingsPanel(arg0: StoreType | string) {
    this.store.setState({
      settingsPanel: arg0
    })
  }

  selectKey(arg0: any) {
    if (!arg0) {
      return
    }
    // let element = this.store.getState().elements[id]
    this.store.setState({
      selectedKey: arg0
      // selectedKey: element.key
    })
  }

  setSetting(arg0: string, arg1: any) {
    let panel = this.getPanel(this.settingsPanel)
    const mode = panel.get("world.mode")
    if (panel.getData()[`world.` + mode + " settings." + arg0]) {
      this.getPanel(this.settingsPanel).setValueAtPath(
        `world.` + mode + " settings." + arg0,
        arg1,
        true
      )
    }
  }

  useSettings<S extends Schema, T extends SchemaOrFn<S>>(
    name: string | undefined,
    arg1: T,
    hidden?: boolean
  ): [SchemaToValues<T>] {
    const settingsPanel = usePanel(this.store((s) => s.settingsPanel))
    const mode = this.useMode("editor")
    useControls(
      `world.` + `${mode ? "editor" : "play"} settings`,
      {},
      { order: 1001 },
      {
        store: settingsPanel.store
      },
      [mode]
    )

    let props = usePersistedControls(
      `world.` +
        `${mode ? "editor" : "play"} settings` +
        (name ? `.${name}` : ""),
      arg1,
      [mode],
      settingsPanel.store,
      hidden
    )

    return props as any
  }

  createElement(
    id: string,
    source: JSXSource,
    componentType: string | import("react").FC<{}>,
    props: any
  ): T {
    let element = new this.elementConstructor(
      id,
      source,
      componentType,
      null,
      props
    )

    element.editor = this
    return element as any as T
  }

  addPlugin(plugin: {
    applicable: (arg0: any) => boolean
    debug?: (arg0: any, arg1: any, arg2?: any) => () => void
  }) {
    this.plugins.push(plugin)
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
