import {
  createElement,
  FC,
  Fragment,
  useContext,
  useEffect,
  useId,
  useMemo
} from "react"
import { EditableContext } from "./EditableContext"
import { EditableElement } from "./EditableElement"

import { CommandBarManager, CommandManager } from "@editable-jsx/commander"
import { PanelManager } from "@editable-jsx/panels"
import { Editable, editable } from "./editable"
import { HistoryManager } from "./history"

import { BirpcReturn } from "birpc"
import {
  createStore,
  EditPatch,
  interpret,
  ISettings,
  ISettingsImpl,
  JSXSource,
  MachineState,
  persisted,
  Schema,
  SchemaToValues,
  Settings,
  Store,
  useSelector
} from "../../state-utils/dist/editable-jsx-state.cjs"
import { ComponentLoader } from "./component-loader"
import { editorMachine } from "./editor.machine"
import { EditorPlugin } from "./EditorPlugin"
import { Helpers } from "./helpers"
import { Tree } from "./Tree"

export type EditorStoreStateType = {
  selectedId: null | string
  selectedKey: null | string
  elements: Record<string, EditableElement>
  settingsPanel: string
}

type RpcServerFunctions = {
  save(patches: EditPatch | EditPatch[]): Promise<void>
  initializeComponentsWatcher(): Promise<
    { fileName: string; components: string[] }[]
  >
}

export class Editor<T extends EditableElement = EditableElement>
  extends EventTarget
  implements ISettings
{
  /**
   * Constructor used to create the editableElement. The default is the EditableElement class
   *
   * Specfic editors can override this to use their own override EditableElement class
   */
  elementConstructor = EditableElement

  /**
   * a store to keep track of all the editor state, eg. settings, mode, selected element, etc.
   */
  store: Store<EditorStoreStateType>
  useStore

  tree?: Tree

  /**
   * used to add undo/redo functionality
   */
  history: HistoryManager

  /**
   * Command Manager
   */
  commands: CommandManager

  commandBar: CommandBarManager

  /**
   * components
   */
  loader: ComponentLoader

  panels: PanelManager
  /**
   * a set with all the tree-ids of the expanded elements
   */
  expanded: Set<string>

  remount?: () => void

  rootId: string

  /**
   * state machine that controls the editor
   */
  machine = editorMachine
  service
  send

  settings: ISettingsImpl

  constructor(
    public plugins: any[],
    public client: BirpcReturn<RpcServerFunctions>
  ) {
    super()

    this.store = createStore("editor", () => ({
      selectedId: null as null | string,
      selectedKey: null as null | string,
      elements: {},
      settingsPanel: "settings"
    }))

    this.useStore = this.store

    this.service = persisted(
      interpret(
        editorMachine.withConfig({
          actions: {
            // selectElement(context, event, meta) {},
            addNewElement(context, event, meta) {}
          }
        }),
        {
          devTools: true
        }
      ),
      "r3f-editor.machine"
    )

    this.send = this.service.send.bind(this.service)

    let core = new Settings()

    let settingsPath = (path?: string | undefined) => {
      return (
        `world.` +
        `${this.state.toStrings()[0]} settings` +
        (path ? "." + path : "")
      )
    }
    let editor = this

    this.settings = {
      get: (key: string) =>
        Settings.getSettingsAtPath(this.settings, settingsPath(key)),
      set: (values) => Settings.setSettingsAtPaths(this.settings, values),
      path: settingsPath,
      store: core.store,
      get deps() {
        return [editor.mode]
      }
    }

    this.history = new HistoryManager()

    this.commands = new CommandManager(this)

    this.commandBar = new CommandBarManager(this, this.commands)

    this.panels = new PanelManager(this.settings)

    this.loader = new ComponentLoader(this.client)
    this.loader.initialize()

    // initialize root to nothing
    this.rootId = ""

    this.expanded = localStorage.getItem("collapased")
      ? new Set(JSON.parse(localStorage.getItem("collapased")!))
      : new Set()
  }

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
  renderElement(component: any, props: any, forwardRef: any) {
    const [editableElement, editableProps] = this.useElement(
      component,
      props,
      forwardRef
    )

    if (editableElement.forwardedRef) {
      return (
        <EditableContext.Provider value={editableElement}>
          <editableElement.type {...editableProps} />
          {editableElement.mounted && <Helpers />}
        </EditableContext.Provider>
      )
    } else {
      return (
        <EditableContext.Provider value={editableElement}>
          <editableElement.type {...editableProps} />
          <Helpers />
        </EditableContext.Provider>
      )
    }
  }

  useState<T>(selector: (emitted: MachineState<typeof editorMachine>) => T): T {
    return useSelector(this.service, selector)
  }

  get mode() {
    return this.state.toStrings()[0]
  }

  useMode<K extends string | undefined>(name?: K) {
    return this.useState((state) => state.toStrings()[0])
  }

  useSelectedElement() {
    return this.useState(() => this.selectedElement)
  }

  useStates(arg0: string) {
    return this.useState((state) => state.toStrings()[0] === arg0)
  }

  get state() {
    return this.service.getSnapshot()
  }

  // should be overriden by subclasses
  setRef(element: any, ref: any) {}

  async saveDiff(diff: EditPatch) {
    await this.client.save(diff)
  }

  async save(diffs: EditPatch[]) {
    for (let diff of diffs) {
      await this.saveDiff(diff)
    }
  }

  /***********************************
   *            ELEMENT TREE
   * ********************************/

  get root() {
    return this.store.getState().elements[this.rootId]
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

  appendNewElement(
    element: EditableElement,
    componentType: string | FC,
    props: any
  ) {
    console.log("appendNewElement", componentType)
    if (typeof componentType === "string") {
      console.log("appendNewElement", componentType)
      element.refs.setMoreChildren?.((children) => [
        ...children,
        createElement(editable[componentType], {
          _source: {
            ...element.source,
            lineNumber: -1,
            elementName: componentType
          },
          key: children.length,
          ...props
        })
      ])
    } else {
      console.log("appendNewElement", componentType)
      element.refs.setMoreChildren?.((children) => [
        ...children,
        createElement(Editable, {
          component: componentType,
          _source: {
            ...element.source,
            lineNumber: -1,
            elementName:
              componentType.displayName || componentType.name || undefined
          },
          key: children.length,
          ...props
        } as any)
      ])
    }
  }

  deleteElement(element: EditableElement) {
    element.delete()
    this.clearSelection()
  }

  appendElement(element: EditableElement, parent: EditableElement | null) {
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

  removeElement(element: EditableElement, parent: EditableElement | null) {
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
   * useElement creates a new Element for the given component type and props and returns the element and the props
   * you need to pass to the component
   * @param Component The component type that we are going to render, it used to detect the name of the component, and can be switched later
   * @param props The props that we are going to pass to the component
   * @param forwardRef true or ref if we want to forward the ref to the component or undefined
   * @returns
   */
  useElement(_Component: any, props: any, forwardRef?: any): [T, any] {
    const id = props.id || useId()

    const editableElement = useMemo(() => {
      return this.createElement(id, props._source ?? {}, _Component, props)
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
    editableElement.update(props._source ?? {}, props)

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
          typeof props.children === "function"
            ? props.children
            : createElement(Fragment, null, props.children, moreChildren)
      }
    ]
  }

  getElementById(id: string): EditableElement {
    return this.store.getState().elements[id]
  }

  getElementByTreeId(id: string): EditableElement | null {
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

  /***********************************
   *            SELECTION
   * ********************************/

  get selectedElement() {
    if (this.state.context.selectedId) {
      return this.getElementByTreeId(this.state.context.selectedId!)
    }

    return null
  }

  select(element: EditableElement<any>): void {
    this.send("SELECT", { elementId: element.treeId })
  }

  clearSelection(): void {
    this.send("CLEAR_SELECTION")
  }

  isSelected(arg0: EditableElement) {
    return this.state.context.selectedId === arg0.treeId
  }

  /***********************************
   *            SETTINGS
   * ********************************/

  useSettings<S extends Schema>(
    name: string,
    arg1: S,
    hidden?: boolean
  ): SchemaToValues<S> {
    // make sure to rerender when the mode changes
    this.useMode()

    Settings.useSettingsFolder(this.settings, undefined, {
      order: -1,
      render: () => this.selectedElement === null,
      collapsed: true
    })

    return Settings.useSettings(this.settings, name, arg1, {
      hidden
    })
  }

  /**
   * PLUGINS
   */

  addPlugin(plugin: EditorPlugin) {
    this.plugins.push(plugin)
  }
}
