import {
  CommandBarContext,
  CommandManagerContext
} from "@editable-jsx/commander"
import { EditorContext, useEditor } from "@editable-jsx/core"
import { PanelManagerContext } from "@editable-jsx/panels"
import { SettingsProvider } from "./SettingsProvider"
import { ThreeFloatingProvider } from "./ThreeFloating"

export function EditorProvider({
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
            <PanelManagerContext.Provider value={editor.panels}>
              <ThreeFloatingProvider>{children}</ThreeFloatingProvider>
            </PanelManagerContext.Provider>
          </CommandBarContext.Provider>
        </CommandManagerContext.Provider>
      </SettingsProvider>
    </EditorContext.Provider>
  )
}
