import { useEditor } from "@editable-jsx/core"
import { PropsWithChildren, useMemo } from "react"
import { SettingsContext } from "../../../state-utils/dist/editable-jsx-state.cjs"

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
