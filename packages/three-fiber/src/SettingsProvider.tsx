import { useEditor } from "@editable-jsx/editable"
import { SettingsContext } from "@editable-jsx/state"
import { PropsWithChildren, useMemo } from "react"

export function SettingsProvider({ children }: PropsWithChildren) {
  const editor = useEditor()
  const mode = editor.useMode()

  const settings = useMemo(
    () => ({ settings: editor.settings }),
    [mode, editor.settings]
  )

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  )
}
