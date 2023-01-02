import { ControlledStore, defaultStore } from "./store"

export interface ISettings {
  settingsStore: ControlledStore
  getSetting(arg0: string): any
  settingsDeps?: any[]
  setSettings<T extends Record<string, any>>(values: T): void
  settingsPath(name: string): string
}

function resolveSettings(sets: ISettings, arg0: { [key: string]: any }) {
  let settings = {} as Record<string, any>
  for (let key in arg0) {
    let value = arg0[key]
    if (typeof value === "function") {
      value = (value as (...args: any[]) => any)(sets.getSetting(key))
    }
    settings[sets.settingsPath(key)] = value
  }
  return settings
}

export class Settings {
  store: ControlledStore = defaultStore

  static getSettingsAtPath(manager: ISettings, path: string) {
    return manager.settingsStore.get(path)
  }

  static setSettingsAtPaths(
    manager: ISettings,
    values: { [key: string]: any }
  ) {
    let settings = resolveSettings(manager, values)
    console.log("settings", settings)

    return manager.settingsStore.set(settings, true)
  }

  get(arg0: string) {
    return this.store.get(arg0)
  }

  set<T extends string>(values: T, value: any): void
  set<T extends Record<string, any>>(values: T): void
  set<T extends string | Record<string, any>>(
    values: T,
    value?: T extends string ? any : undefined
  ): void {
    if (typeof values === "string") {
      this.store.set({ [values]: value }, true)
    } else {
      this.store.set(values, true)
    }
  }
}
