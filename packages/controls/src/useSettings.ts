import { Schema, SchemaToValues } from "leva/plugin"
import { createContext, useContext } from "react"
import { ISettings } from "./settings"
import { usePersistedControls } from "./usePersistedControls"

export const SettingsContext = createContext({} as ISettings)
const useSettingsContext = () => {
  return useContext(SettingsContext)
}

export function useSettings<S extends Schema>(
  name: string,
  schema: S
): SchemaToValues<S> {
  const settings = useSettingsContext()
  let props = usePersistedControls(
    settings.settingsPath(name),
    schema,
    settings.settingsDeps || [],
    settings.settingsStore
  )

  return props as any
}
