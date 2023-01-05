import {
  CommandBarContext,
  CommandManagerContext
} from "@editable-jsx/commander"
import { EditorContext, useEditor } from "@editable-jsx/editable"
import { PanelsProvider } from "@editable-jsx/panels"
import { SettingsProvider } from "./SettingsProvider"
import { ThreeFloatingProvider } from "./ThreeFloating"

export function ThreeEditorProvider({
  editor,
  children
}: {
  editor: ReturnType<typeof useEditor>
  children: React.ReactNode
}) {
  return (
    <EditorContext.Provider value={editor}>
      <SettingsProvider>
        <CommandManagerContext.Provider value={editor.commands}>
          <CommandBarContext.Provider value={editor.commandBar}>
            <PanelsProvider manager={editor.panels}>
              <ThreeFloatingProvider>{children}</ThreeFloatingProvider>
            </PanelsProvider>
          </CommandBarContext.Provider>
        </CommandManagerContext.Provider>
      </SettingsProvider>
    </EditorContext.Provider>
  )
}
