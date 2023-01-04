import {
  ControlledStore,
  createControlledStore,
  createStore,
  defaultStore,
  interpret,
  ISettings,
  ISettingsImpl,
  MachineInterpreter,
  Schema,
  SchemaToValues,
  Settings,
  Store,
  Subscribable,
  useSelector,
  useSettings
} from "@editable-jsx/state"
import { panelMachine } from "./panels.machine"

type PanelSettings = {
  position: [number, number]
  floating: boolean
  side: "left" | "right"
}

export class Panel implements ISettings {
  #store: ControlledStore
  settings: ISettingsImpl<PanelSettings>
  constructor(
    public name: string,
    public manager: PanelManager,
    _store: ControlledStore = createControlledStore()
  ) {
    this.#store = _store
    // @ts-ignore
    this.#store.name = name

    let panel = this
    this.settings = {
      store: this.manager.settings.store,
      path: (path: string) =>
        this.manager.settings.path(
          "panels." + this.name + (path ? "." + path : "")
        ),
      get: (path: keyof PanelSettings) => {
        return Settings.getSettingsAtPath(
          this.settings,
          this.settings.path(path)
        )
      },
      get deps() {
        return panel.manager.settings.deps || []
      },
      set: (arg0: {
        [key in keyof PanelSettings]?:
          | PanelSettings[key]
          | ((prev: PanelSettings[key]) => PanelSettings[key])
      }) => {
        Settings.setSettingsAtPaths(this.settings, arg0)
      }
    }
  }

  // to be used for leva APIs
  get store(): ControlledStore {
    if (this.#store === defaultStore) {
      // this is a hack because leva's APIs need that we send undefined for the `store`
      // option if we mean the default store
      return undefined as any
    }
    return this.#store
  }

  has(path: any) {
    return this.#store.getData()[path] !== undefined
  }

  set(path: any, arg1: any, arg2: boolean = true) {
    this.#store.setValueAtPath(path, arg1, arg2)
  }

  getData() {
    return this.#store.getData()
  }

  get(path: any) {
    return this.#store.get(path)
  }

  setState(...args: Parameters<ControlledStore["useStore"]["setState"]>) {
    return this.#store.useStore.setState(...args)
  }

  dock(side: "left" | "right") {
    this.settings.set({
      floating: false,
      side
    })
  }

  isFloating(): boolean {
    return this.settings.get("floating")
  }

  useSettings<S extends Schema>(arg1: S, hidden?: boolean): SchemaToValues<S> {
    return useSettings(`panels.` + this.name, arg1)
  }
}

export class PanelManager implements ISettings {
  /** reactive store */
  store: Store<{
    panels: Record<string, Panel>
  }>
  useStore

  settings: ISettingsImpl
  /** State Machine */
  service
  send
  subscribe

  constructor(settings: ISettingsImpl<any>) {
    this.settings = settings
    this.store = createStore("panels", (set, get) => ({
      panels: {
        settings: new Panel("settings", this, defaultStore)
      }
    }))

    this.useStore = this.store

    this.service = interpret(
      panelMachine.withConfig({
        guards: {
          isFloating: (context, event) => {
            return this.get(event.panel).isFloating()
          }
        },
        actions: {
          dockToLeftPanel: (context, event) => {
            this.get(event.panel).dock("left")
          },
          dockToRightPanel: (context, event) => {
            this.get(event.panel).dock("right")
          },
          stopDragging: (context, event) => {
            this.get(event.panel).settings.set({
              position: (prevPosition) => [
                prevPosition[0] + event.event.movement[0],
                prevPosition[1] + event.event.movement[1]
              ]
            })
          },
          undock: (context, event) => {
            this.get(event.panel).settings.set({
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

    this.service.start()

    this.send = this.service.send.bind(this.service)
    this.subscribe = this.service.subscribe.bind(this.service)
  }

  get machine() {
    return this.service.getSnapshot()
  }

  useState<
    T,
    TEmitted = MachineInterpreter<typeof panelMachine> extends Subscribable<
      infer Emitted
    >
      ? Emitted
      : never
  >(selector: (emitted: TEmitted) => T) {
    return useSelector(this.service, selector)
  }

  get panels() {
    return this.store.getState().panels
  }

  get(name: string | Panel | ControlledStore): Panel {
    let panels = this.panels
    if (typeof name === "string") {
      if (panels[name]) return panels[name]

      panels[name] = new Panel(name, this)

      this.store.setState(() => ({
        panels
      }))
      return panels[name]
    } else {
      return name as Panel
    }
  }

  showAllPanels() {
    let panelNames = Object.keys(this.panels)
    let settings = {} as Record<string, any>
    for (let i = 0; i < panelNames.length; i++) {
      settings[this.get(panelNames[i]).settings.path("hidden")] = false
    }
    this.settings.set(settings)
  }

  hideAllPanels() {
    let panelNames = Object.keys(this.panels)
    let settings = {} as Record<string, any>
    for (let i = 0; i < panelNames.length; i++) {
      settings[this.get(panelNames[i]).settings.path("hidden")] = true
    }

    this.settings.set(settings)
  }
}
