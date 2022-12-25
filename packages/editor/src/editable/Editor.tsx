/* eslint-disable react-hooks/rules-of-hooks */
import { BirpcReturn } from "birpc"
import { levaStore, useControls } from "leva"
import {
  Schema,
  SchemaToValues,
  StoreType
} from "leva/dist/declarations/src/types"
import {
  createContext,
  createElement,
  Fragment,
  useContext,
  useEffect,
  useId,
  useMemo
} from "react"
import create from "zustand"
import { createLevaStore } from "./controls/createStore"
import { Panel, usePanel } from "./controls/Panel"
import {
  SchemaOrFn,
  usePersistedControls
} from "./controls/usePersistedControls"
import { editable } from "./editable"
import { EditableElement } from "./EditableElement"
import { EditableElementContext } from "./EditableElementContext"
import { HistoryManager } from "./HistoryManager"

import { createMachine } from "xstate"
import { CommandManager } from "../commandbar"
import { EditPatch, JSXSource, RpcServerFunctions } from "../types"
import { EditableElementProvider } from "./EditableElementProvider"
import { ComponentLoader } from "../component-loader"

const machine = createMachine({
  id: "editor"
})

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
  /**
   * Constructor used to create the editableElement. The default is the EditableElement class
   *
   * Specfic editors can override this to use their own override EditableElement class
   */
  elementConstructor = EditableElement

  /**
   * a store to keep track of all the editor state, eg. settings, mode, selected element, etc.
   */
  store: EditorStoreType

  /**
   * used to add undo/redo functionality
   */
  history: HistoryManager = new HistoryManager()

  /**
   * Command Manager
   */
  commands: CommandManager = new CommandManager()

  /**
   * components
   */
  loader: ComponentLoader

  /**
   * a set with all the tree-ids of the expanded elements
   */
  expanded: Set<string>

  /**
   * used by the React API to wrap the React element with whatever we need,
   * should be overriden by superclasses to add more wrappers if necessary.
   *
   * this is applied to each and every editableElement in your tree
   *
   * it is not the only way to add things to the tree. You can also use the
   * `helpers` API from the plugins to add helpers to specific types of
   * elements
   */
  EditableElementProvider: React.FC<any> = EditableElementProvider

  remount?: () => void

  constructor(
    public plugins: any[],
    public client: BirpcReturn<RpcServerFunctions>
  ) {
    super()
    this.store = createEditorStore()
    this.root.editor = this as any
    this.root.index = ""
    this.expanded = localStorage.getItem("collapased")
      ? new Set(JSON.parse(localStorage.getItem("collapased")!))
      : new Set()

    this.loader = new ComponentLoader(this.client)
    this.loader.initialize()
  }

  setRef(element: any, ref: any) {}

  async saveDiff(diff: EditPatch) {
    await this.client.save(diff)
  }

  async save(diffs: EditPatch[]) {
    for (let diff of diffs) {
      await this.saveDiff(diff)
    }
  }

  /**
   * ELEMENT TREE
   */

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

  appendNewElement(element: EditableElement, componentType: string) {
    if (typeof componentType === "string") {
      element.refs.setMoreChildren?.((children) => [
        ...children,
        createElement(editable[componentType], {
          _source: {
            ...element.source,
            lineNumber: -1,
            elementName: componentType
          },
          key: children.length
        })
      ])
    }
  }

  deleteElement(element: EditableElement) {
    element.delete()
    this.clearSelection()
    // await this.client.save({
    //   ...params,
    //   action_type: "deleteElement"
    // })
  }

  appendElement(element: EditableElement, parentId: string | null) {
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

  useElement(Component: any, props: any, forwardRef?: any): [T, any] {
    const id = useId()

    const editableElement = useMemo(() => {
      return this.createElement(id, props._source, Component, props)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [Component, id])

    // attaches the render, remount functions and returns a key that
    // need to be passed to the React element to cause remounts
    const { key, ref, moreChildren } = editableElement.useRenderKey(forwardRef)

    // update the element with the latest props and source
    editableElement.update(props._source, props)

    const parentId = useContext(EditableElementContext)?.id!

    useEffect(() => {
      if (!editableElement.deleted) {
        this.appendElement(editableElement, parentId)
      }
      return () => {
        this.removeElement(editableElement, parentId)
      }
    }, [parentId, editableElement, editableElement.deleted])

    return [
      editableElement,
      {
        ...props,
        ...editableElement.props,
        key,
        ref: forwardRef ? ref : undefined,
        children:
          typeof props.children === "function"
            ? props.children
            : createElement(Fragment, null, props.children, moreChildren)
      }
    ]
  }

  get root() {
    return this.store.getState().elements.root
  }

  getElementById(id: string): EditableElement {
    return this.store.getState().elements[id]
  }

  findEditableElement(el: any): T | null {
    throw new Error("Method not implemented.")
  }

  /**
   * SELECTION
   */

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
    this.store.setState({
      selectedId: id
    })
  }

  clearSelection(): void {
    this.store.setState({
      selectedId: null,
      selectedKey: null
    })
  }

  isSelected(arg0: EditableElement) {
    return this.store.getState().selectedId === arg0.id
  }

  selectKey(arg0: any) {
    if (!arg0) {
      return
    }
    this.store.setState({
      selectedKey: arg0
    })
  }

  /**
   * PANELS
   **/

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

  /**
   *  SETTINGS
   * */

  settings = createLevaStore()

  get settingsPanel(): Panel {
    return this.getPanel(this.store.getState().settingsPanel)
  }

  set settingsPanel(arg0: StoreType | string) {
    this.store.setState({
      settingsPanel: arg0
    })
  }

  getSettings(arg0: string): number[] | ArrayLike<number> {
    return (
      this.settingsPanel.getData()[
        `world.` + this.settingsPanel.get("world.mode") + " settings." + arg0
      ] as any
    ).value as any
  }

  setSetting(arg0: string, arg1: any) {
    const mode = this.settingsPanel.get("world.mode")
    if (this.settingsPanel.getData()[`world.` + mode + " settings." + arg0]) {
      this.settingsPanel.setValueAtPath(
        `world.` + mode + " settings." + arg0,
        arg1,
        true
      )
    }
  }

  setSettings(values: any) {
    this.getPanel(this.settingsPanel).useStore.setState(({ data }: any) => {
      for (let key in values) {
        data[`world.` + data["world.mode"].value + ` settings.` + key].value =
          values[key]
      }
      return { data }
    })
  }

  useMode<K extends string | undefined>(
    name?: K
  ): K extends undefined ? string : boolean {
    return this.settingsPanel.useStore((s: any) =>
      name ? s.data["world.mode"]?.value === name : s.data["world.mode"]?.value
    ) as any
  }

  useSettingsPanel() {
    return usePanel(this.store((s) => s.settingsPanel))
  }

  useSettings<S extends Schema, T extends SchemaOrFn<S>>(
    name: string | undefined,
    arg1: T,
    hidden?: boolean
  ): [SchemaToValues<T>] {
    const settingsPanel = this.useSettingsPanel()
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

  /**
   * PLUGINS
   */

  addPlugin(plugin: {
    applicable: (arg0: any) => boolean
    debug?: (arg0: any, arg1: any, arg2?: any) => () => void
  }) {
    this.plugins.push(plugin)
  }
}

export const EditorContext = createContext<Editor | null>(null)
