import {
  CommandBarContext,
  CommandManagerContext
} from "@editable-jsx/commander"
import { PanelsProvider } from "@editable-jsx/panels"
import { SettingsContext } from "@editable-jsx/state"
import { FloatingContext } from "@editable-jsx/ui"
import { useId } from "react"
import { EditorContext } from "./EditorContext"
import { IdContext } from "./IdContext"
import { useEditor } from "./useEditor"

function FloatingWindow({ children }: { children: any }) {
  return children({ width: window.innerWidth })
}

export function EditorProvider({
  editor,
  children
}: {
  editor: ReturnType<typeof useEditor>
  children: React.ReactNode
}) {
  const id = useId()
  return (
    <EditorContext.Provider value={editor}>
      <SettingsContext.Provider value={editor}>
        <CommandManagerContext.Provider value={editor.commands}>
          <CommandBarContext.Provider value={editor.commandBar}>
            <PanelsProvider manager={editor.panels}>
              <IdContext.Provider value={id}>
                <FloatingContext.Provider value={FloatingWindow}>
                  {children}
                </FloatingContext.Provider>
              </IdContext.Provider>
            </PanelsProvider>
          </CommandBarContext.Provider>
        </CommandManagerContext.Provider>
      </SettingsContext.Provider>
    </EditorContext.Provider>
  )
}
