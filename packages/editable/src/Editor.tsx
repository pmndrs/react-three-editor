import {
  createElement,
  Fragment,
  useContext,
  useEffect,
  useId,
  useMemo
} from "react"
import { Editable } from "./Editable"
import { EditableContext } from "./EditableContext"

import { levaStore, useControls } from "leva"
import {
  DataInput,
  Schema,
  SchemaToValues,
  StoreType
} from "leva/dist/declarations/src/types"
import create from "zustand"
import { editable } from "./components"
import { HistoryManager } from "./HistoryManager"

import { ComponentLoader } from "../component-loader"
import { EditPatch, JSXSource, RpcServerFunctions } from "../types"
import { CommandManager } from "./commands/manager"
import { EditableComponent } from "./EditableComponent"

levaStore.name = "settings"

export type EditorStoreStateType = {
  selectedId: null | string
  selectedKey: null | string
  elements: Record<string, Editable>
  settingsPanel: string | StoreType
}

import {
  createStore,
  persisted,
  usePersistedControls
} from "@editable-jsx/controls"
import { Settings } from "@editable-jsx/controls/src/Settings"
import { useSelector } from "@xstate/react"
import { BirpcReturn } from "birpc"
import { useHotkeys } from "react-hotkeys-hook"
import {
  ActorRef,
  interpret,
  Interpreter,
  StateMachine,
  Subscribable
} from "xstate"
import { CommandBar } from "./commands/CommandBar"
import { editorMachine } from "./editor.machine"
import { Panel, PanelManager } from "./panels/PanelManager"
import { panelMachine } from "./panels/panels.machine"

export type MachineInterpreter<M> = M extends StateMachine<
  infer Context,
  infer Schema,
  infer Event,
  infer State,
  infer _A,
  infer _B,
  infer _C
>
  ? Interpreter<Context, Schema, Event, State, _C>
  : never

export type EditorStoreType = ReturnType<typeof createEditorStore>

const createEditorStore = () => {
  return create<EditorStoreStateType>(() => ({
    selectedId: null,
    selectedKey: null,
    elements: {
      // root: new EditableElement("root", {} as any, "editor", null)
    },
    settingsPanel: "settings"
  }))
}
// const createEditorStore = () => {}

type Diff = {
  action_type: string
  value: {
    [x: string]: any
  }
  source: any
}

export class Editor<T extends Editable = Editable> extends EventTarget {
  uiPanels: MachineInterpreter<typeof panelMachine>

  useKeyboardShortcut(
    name: string,
    initialShortcut: string,
    execute: () => void
  ) {
    const [shortcut] = this.useSettings("shortcuts", {
      [name]: initialShortcut
    })

    useHotkeys(
      shortcut[name],
      execute,
      {
        preventDefault: true
      },
      [shortcut[name], execute]
    )
  }

  useSelectedElement() {
    return this.useState(() => this.selectedElement)
  }

  useStates(arg0: string) {
    return this.useState((s) => s.toStrings()[0] === arg0)
  }

  /**
   * Constructor used to create the editableElement. The default is the EditableElement class
   *
   * Specfic editors can override this to use their own override EditableElement class
   */
  elementConstructor = Editable

  /**
   * a store to keep track of all the editor state, eg. settings, mode, selected element, etc.
   */
  store: EditorStoreType = createStore<EditorStoreStateType>("editor", () => ({
    selectedId: null,
    selectedKey: null,
    elements: {
      // root: new EditableElement("root", {} as any, "editor", null)
    },
    settingsPanel: "settings"
  }))
  useStore: EditorStoreType = this.store

  /**
   * used to add undo/redo functionality
   */
  history: HistoryManager = new HistoryManager()

  /**
   * Command Manager
   */
  commands: CommandManager = new CommandManager()

  commandBar: CommandBar = new CommandBar(this)

  /**
   * components
   */
  loader: ComponentLoader

  /**
   * a set with all the tree-ids of the expanded elements
   */
  expanded: Set<string>

  panels: PanelManager

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
  Element = EditableComponent

  remount?: () => void
  rootId: string

  service
  send

  machine = editorMachine

  constructor(
    public plugins: any[],
    public client: BirpcReturn<RpcServerFunctions>
  ) {
    super()

    this.settings = new Settings()
    this.panels = new PanelManager(this.settings)

    // @ts-ignore
    this.uiPanels = interpret(
      panelMachine.withConfig({
        guards: {
          isFloating: (context, event) => {
            return this.panels.get(event.panel).isFloating()
          }
        },
        actions: {
          dockToLeftPanel: (context, event) => {
            this.panels.get(event.panel).dock("left")
          },
          dockToRightPanel: (context, event) => {
            this.panels.get(event.panel).dock("right")
          },
          stopDragging: (context, event) => {
            this.panels.get(event.panel).setSettings({
              position: (prevPosition) => [
                prevPosition[0] + event.event.movement[0],
                prevPosition[1] + event.event.movement[1]
              ]
            })
          },
          undock: (context, event) => {
            this.panels.get(event.panel).setSettings({
              position: event.event.xy,
              floating: true
            })
          }
        }
      }),
      {
        devTools: true
      }
    )

    this.uiPanels.start()

    this.service = persisted(
      interpret(editorMachine, {
        devTools: true
      }),
      "r3f-editor.machine"
    )
    this.send = this.service.send.bind(this.service)
    this.rootId = ""

    this.expanded = localStorage.getItem("collapased")
      ? new Set(JSON.parse(localStorage.getItem("collapased")!))
      : new Set()

    this.loader = new ComponentLoader(this.client)
    this.loader.initialize()
  }

  useState<
    TActor extends ActorRef<any, any>,
    T,
    TEmitted = TActor extends Subscribable<infer Emitted> ? Emitted : never
  >(selector: (emitted: TEmitted) => T): T {
    return useSelector(this.service, selector)
  }

  get state() {
    return this.service.getSnapshot()
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

  appendNewElement(element: Editable, componentType: string) {
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
    } else {
      element.refs.setMoreChildren?.((children) => [
        ...children,
        createElement(Editable, {
          component: componentType,
          _source: {
            ...element.source,
            lineNumber: -1,
            elementName: undefined
          },
          key: children.length
        } as any)
      ])
    }
  }

  deleteElement(element: Editable) {
    element.delete()
    this.clearSelection()
  }

  appendElement(element: Editable, parent: Editable | null) {
    let parentId = parent?.id!
    if (parentId) {
      element.parentId = parentId
      this?.store?.setState((el) => {
        let parent = el.elements[parentId] ?? {}
        let newIndex = parent.childIds?.length ?? 0
        element.index = `${newIndex}`
        parent = Object.assign(parent, {
          childIds: [...(el.elements[parentId]?.childIds ?? []), element.id]
        })

        element.index = `${newIndex}`
        let newLement = Object.assign(element, el.elements[element.id])
        return {
          elements: {
            ...el.elements,
            [newLement.id]: newLement,
            [parentId]: parent
          }
        }
      })
    } else {
      if (element.id !== undefined) {
        this?.store?.setState((el) => ({
          elements: {
            ...el.elements,
            [element.id]: Object.assign(element, el.elements[element.id])
          }
        }))
      }
    }
  }

  removeElement(element: Editable, parent: Editable | null) {
    let parentId = parent?.id!
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

  /**
   *
   * @param Component The component type that we are going to render, it used to detect the name of the component, and can be switched later
   * @param props The props that we are going to pass to the component
   * @param forwardRef true or ref if we want to forward the ref to the component or undefined
   * @returns
   */
  useElement(_Component: any, props: any, forwardRef?: any): [T, any] {
    const id = props.id || useId()

    const editableElement = useMemo(() => {
      return this.createElement(id, props._source, _Component, props)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_Component, id])

    // attaches the render, remount functions and returns a key that
    // need to be passed to the React element to cause remounts
    const {
      key,
      ref,
      moreChildren,
      component: Component
    } = editableElement.useRenderState(forwardRef)

    // update the element with the latest props and source
    editableElement.update(props._source, props)

    // see if we have a parent element
    const parent = useContext(EditableContext)!

    useEffect(() => {
      if (!editableElement.deleted) {
        this.appendElement(editableElement, parent)
        this.send("APPEND_ELEMENT", {
          elementId: editableElement.treeId,
          parentId: parent?.treeId
        })
      }
      return () => {
        this.removeElement(editableElement, parent)
        this.send("REMOVE_ELEMENT", {
          elementId: editableElement.treeId,
          parentId: parent?.treeId
        })
      }
    }, [parent, editableElement, editableElement.deleted])

    return [
      editableElement,
      {
        ...props,
        ...editableElement.props,
        key,
        ref: forwardRef ? ref : undefined,
        children:
          props.children === "function"
            ? props.children
            : createElement(Fragment, null, props.children, moreChildren)
      }
    ]
  }

  get root() {
    return this.store.getState().elements[this.rootId]
  }

  getElementById(id: string): Editable {
    return this.store.getState().elements[id]
  }

  getElementByTreeId(id: string): Editable | null {
    let els = this.store.getState().elements
    let el = Object.values(els).find((e) => e.treeId === id)
    if (el) {
      return el
    }
    return null
  }

  findEditableElement(el: any): T | null {
    throw new Error("Method not implemented.")
  }

  /**
   * SELECTION
   */

  get selectedElement() {
    if (this.state.context.selectedId) {
      return this.getElementByTreeId(this.state.context.selectedId!)
    }

    return null
  }

  select(element: Editable<any>): void {
    this.send("SELECT", { elementId: element.treeId })
  }

  clearSelection(): void {
    this.send("CLEAR_SELECTION")
  }

  isSelected(arg0: Editable) {
    return this.state.context.selectedId === arg0.treeId
  }

  /**
   *  SETTINGS
   * */

  settings: Settings

  get settingsPanel(): Panel {
    return this.panels.get(this.store.getState().settingsPanel)
  }

  set settingsPanel(arg0: StoreType | string) {
    this.store.setState({
      settingsPanel: arg0
    })
  }

  getSetting(arg0: string) {
    return this.settings.get(arg0)
  }

  setSetting(arg0: string, arg1: any) {
    let path = this.settingsPath(arg0)
    if (this.settingsPanel.has(path)) {
      this.settingsPanel.set(path, arg1)
    }
  }

  setSettings(values: any) {
    this.settingsPanel.useStore.setState(({ data }) => {
      for (let key in values) {
        if (!data[this.settingsPath(key)]) {
          debugger
        }

        ;(data[this.settingsPath(key)] as DataInput).value = values[key]
      }
      return { data }
    })
  }

  useMode<K extends string | undefined>(name?: K) {
    return this.useState(() => this.state.toStrings()[0])
  }

  settingsPath(arg0?: string | undefined): any {
    return (
      `world.` +
      `${this.state.toStrings()[0]} settings` +
      (arg0 ? "." + arg0 : "")
    )
  }

  get mode() {
    return this.state.toStrings()[0]
  }

  useSettingsPanel() {
    return usePanel(this.store((s) => s.settingsPanel))
  }

  useSettings<S extends Schema>(
    name: string,
    arg1: S,
    hidden?: boolean
  ): [SchemaToValues<S>] {
    const settingsPanel = this.useSettingsPanel()
    const mode = this.useMode()
    useControls(
      this.settingsPath(),
      {},
      { order: 1001, render: () => this.selectedElement === null },
      {
        store: settingsPanel.store
      },
      [mode]
    )

    let props = usePersistedControls(
      this.settingsPath(name),
      arg1,
      [mode],
      settingsPanel.store,
      hidden
    )

    return props as any
  }

  // // Keep track of the current state, and start
  // // with the initial state
  // currentState = editorMachine.initialState

  // // Keep track of the listeners
  // listeners = new Set<(state: typeof editorMachine.initialState) => void>()

  // // Have a way of sending/dispatching events
  // send(
  //   arg0: Parameters<typeof editorMachine.transition>[1],
  //   arg1?: Parameters<typeof editorMachine.transition>[2]
  // ) {
  //   // Remember: machine.transition() is a pure function
  //   this.currentState = editorMachine.transition(this.currentState, arg0, arg1)

  //   // Get the side-effect actions to execute
  //   const { actions } = this.currentState

  //   actions.forEach((action) => {
  //     // If the action is executable, execute it
  //     console.log(action)
  //     typeof action.exec === "function" && action.exec()
  //   })

  //   // Notify the listeners
  //   this.listeners.forEach((listener) => listener(this.currentState))
  // }

  // listen(listener) {
  //   this.listeners.add(listener)
  // }

  // unlisten(listener) {
  //   this.listeners.delete(listener)
  // }

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
