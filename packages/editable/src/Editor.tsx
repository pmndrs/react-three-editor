import { EditableElement } from "./EditableElement"

import { CommandBarManager, CommandManager } from "@editable-jsx/commander"
import { PanelManager } from "@editable-jsx/panels"
import { HistoryManager } from "./history"

import {
  createStore,
  EditPatch,
  interpret,
  ISettings,
  ISettingsImpl,
  MachineState,
  persisted,
  Schema,
  SchemaToValues,
  Settings,
  Store,
  useSelector
} from "@editable-jsx/state"
import { BirpcReturn } from "birpc"
import { ComponentLoader } from "./component-loader"
import { EditableDocument } from "./EditableDocument"
import { EditableRoot } from "./EditableRoot"
import { editorMachine } from "./editor.machine"
import { EditorPlugin } from "./EditorPlugin"
import { Tree } from "./Tree"

export type EditorStoreStateType = {
  settingsPanel: string
}

export type RpcServerFunctions = {
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
  rootConstructor = EditableRoot

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

  document: EditableDocument

  /**
   * state machine that controls the editor
   */
  machine = editorMachine
  service
  send

  modeSettings: ISettingsImpl
  settings: ISettingsImpl

  plugins: any[]
  client: BirpcReturn<RpcServerFunctions>

  constructor({
    plugins = [],
    client
  }: {
    plugins?: EditorPlugin[]
    client: BirpcReturn<RpcServerFunctions>
  }) {
    super()

    this.document = new EditableDocument()
    this.document.ownerDocument = this.document
    this.document.editor = this

    this.plugins = plugins
    this.client = client

    this.store = createStore("editor", () => ({
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

    let modeSettingsPath = (path?: string | undefined) => {
      return `${this.state.toStrings()[0]} mode` + (path ? "." + path : "")
    }
    let editor = this

    this.modeSettings = {
      get: (key: string) =>
        Settings.getSettingsAtPath(this.modeSettings, modeSettingsPath(key)),
      set: (values) => Settings.setSettingsAtPaths(this.modeSettings, values),
      path: modeSettingsPath,
      store: core.store,
      get deps() {
        return [editor.mode]
      }
    }

    let settingsPath = (path?: string | undefined) => {
      return `settings` + (path ? "." + path : "")
    }

    this.settings = {
      get: (key: string) =>
        Settings.getSettingsAtPath(this.settings, settingsPath(key)),
      set: (values) => Settings.setSettingsAtPaths(this.settings, values),
      path: settingsPath,
      store: core.store
    }

    this.history = new HistoryManager()

    this.commands = new CommandManager(this)

    this.commandBar = new CommandBarManager(this, this.commands)

    this.panels = new PanelManager(this.modeSettings)

    this.loader = new ComponentLoader(this.client)
    this.loader.initialize()

    // initialize root to nothing
    // this.rootId = ""

    // this.expanded = localStorage.getItem("collapased")
    //   ? new Set(JSON.parse(localStorage.getItem("collapased")!))
    //   : new Set()
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
    if (this.state.context.selectedRootId) {
      return this.document.getElementByTreeId(
        this.state.context.selectedRootId!
      )
    }
  }

  /***********************************
   *            SELECTION
   * ********************************/

  get selectedElement() {
    if (this.state.context.selectedId) {
      return this.document.getElementByTreeId(this.state.context.selectedId!)
    }

    return null
  }

  select(element: EditableElement<any>): void {
    console.log(element.treeId)
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

  registerPlugin(plugin: EditorPlugin) {
    this.plugins.push(plugin)
  }

  unregisterPlugin(plugin: EditorPlugin) {
    this.plugins = this.plugins.filter((p) => p !== plugin)
  }
}
