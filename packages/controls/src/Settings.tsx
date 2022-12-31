import { ControlledStore, defaultStore } from "./createStore"

export class Settings {
  store: ControlledStore = defaultStore

  get(arg0: string) {
    this.store.get(this.settingsPath(arg0))
  }

  settingsPath(arg0: string): string {
    throw new Error("Method not implemented.")
  }

  set(values: Record<string, any>) {
    this.store.set(values, true)
  }
}
