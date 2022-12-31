import {
  ControlledStore,
  createControlledStore,
  defaultStore
} from "@editable-jsx/controls"
import { Settings } from "@editable-jsx/controls/src/Settings"
import { useSelector } from "@xstate/react"
import create from "zustand"
import { panelMachine } from "./panels.machine"

import { ActorRef, interpret, Subscribable } from "xstate"
import { MachineInterpreter } from "../Editor"
export declare function useState<
  TActor extends ActorRef<any, any>,
  T,
  TEmitted = TActor extends Subscribable<infer Emitted> ? Emitted : never
>(
  selector: (emitted: TEmitted) => T,
  compare?: (a: T, b: T) => boolean,
  getSnapshot?: (a: TActor) => TEmitted
): T

export class Panel {
  constructor(
    public name: string,
    public manager: PanelManager,
    public _store: ControlledStore = createControlledStore()
  ) {}

  get store() {
    return this._store
  }

  has(path: any) {
    return this.store.getData()[path] !== undefined
  }

  set(path: any, arg1: any, arg2: boolean) {
    this.store.setValueAtPath(path, arg1, arg2)
  }

  settingsPath(path: string) {
    return "panels." + this.name + "." + path
  }

  get settings(): Settings {
    return this.manager.settings
  }

  dock(arg0: string) {
    throw new Error("Method not implemented.")
  }

  isFloating(): boolean {
    throw new Error("Method not implemented.")
  }

  setSettings(
    arg0: Record<
      string,
      string | number | boolean | number[] | string[] | ((f: any) => any)
    >
  ) {
    let settings = {} as Record<string, any>
    for (let key in arg0) {
      let value = arg0[key]
      if (typeof arg0[key] === "function") {
        value = (arg0[key] as (...args: any[]) => any)(
          this.settings.get(this.settingsPath(key))
        )
      }
      settings[this.settingsPath(key)] = value
    }
    this.settings.set(settings)
  }
}

export class PanelManager {
  subscribe: any
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

  /**
   * PANELS
   **/
  panelStore = create((get, set) => ({
    panels: {
      settings: new Panel("settings", this, defaultStore) as Panel
    } as Record<string, Panel>
  }))

  service
  send

  constructor(public settings: Settings) {
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
            this.get(event.panel).setSettings({
              position: (prevPosition) => [
                prevPosition[0] + event.event.movement[0],
                prevPosition[1] + event.event.movement[1]
              ]
            })
          },
          undock: (context, event) => {
            this.get(event.panel).setSettings({
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

    this.send = this.service.send.bind(this.service)
  }

  get machine() {
    return this.service.getSnapshot()
  }

  get(settingsPanel: string | ControlledStore): Panel {
    return this.getPanel(settingsPanel)
  }

  setSetting(panel: string, arg1: string, arg2: any) {
    throw new Error("Method not implemented.")
  }

  get panels() {
    return this.panelStore.getState().panels
  }

  getPanel(name: string | Panel | ControlledStore): Panel {
    let panels = this.panels
    if (typeof name === "string") {
      if (panels[name]) return panels[name]

      panels[name] = new Panel(name, this)

      this.panelStore.setState(() => ({
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
      settings[this.get(panelNames[i]).settingsPath("hidden")] = false
    }
    this.settings.set(settings)
  }

  hideAllPanels() {
    let panelNames = Object.keys(this.panels)
    let settings = {} as Record<string, any>
    for (let i = 0; i < panelNames.length; i++) {
      settings[this.get(panelNames[i]).settingsPath("hidden")] = true
    }

    this.settings.set(settings)
  }

  dockPanel(panel: string, side: string) {
    this.get(panel).setSettings({
      side,
      floating: false
    })
  }
}
