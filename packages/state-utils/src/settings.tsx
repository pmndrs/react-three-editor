import { useControls } from "leva"
import { FolderSettings, Schema, SchemaToValues } from "leva/plugin"
import { createContext, useContext } from "react"
import { ControlledStore, defaultStore } from "./store"
import { usePersistedControls } from "./usePersistedControls"

export interface ISettings {
  settings: ISettingsImpl
}

export interface ISettingsImpl<T = any> {
  store: ControlledStore
  get(arg0: keyof T): any
  deps?: any[]
  set<
    T extends {
      [key: string]: any
    }
  >(values: {
    [key in keyof T]?: T[key] | ((prev: T[key]) => T[key])
  }): void
  path(name: T | string | undefined): string
}

export const SettingsContext = createContext({} as { settings: ISettingsImpl })
const useSettingsContext = () => {
  return useContext(SettingsContext)
}

export function useSettings<S extends Schema>(
  name: string,
  schema: S
): SchemaToValues<S> {
  const settings = useSettingsContext().settings
  let props = usePersistedControls(
    settings.path(name),
    schema,
    settings.deps || [],
    settings.store
  )

  return props as any
}

function resolveSettings(sets: ISettingsImpl, arg0: { [key: string]: any }) {
  let settings = {} as Record<string, any>
  for (let key in arg0) {
    let value = arg0[key]
    if (typeof value === "function") {
      value = (value as (...args: any[]) => any)(sets.get(key))
    }
    settings[sets.path(key)] = value
  }
  return settings
}

export class Settings {
  store: ControlledStore = defaultStore

  static getSettingsAtPath(settings: ISettingsImpl, path: string) {
    return settings.store.get(path)
  }

  static useSettings<S extends Schema>(
    settings: ISettingsImpl,
    name: string,
    schema: Schema,
    { hidden }: { hidden?: boolean } = {}
  ): SchemaToValues<S> {
    return usePersistedControls(
      settings.path(name),
      schema as any,
      settings.deps || [],
      settings.store
    )
  }

  static useSettingsFolder<S extends Schema>(
    settings: ISettingsImpl,
    name: string | undefined,
    options: FolderSettings
  ): void {
    useControls(
      settings.path(name),
      {},
      options,
      {
        store: settings.store
      },
      settings.deps || []
    )
  }

  static setSettingsAtPaths(
    manager: ISettingsImpl,
    values: { [key: string]: any }
  ) {
    let settings = resolveSettings(manager, values)
    return manager.store.set(settings, true)
  }
}
