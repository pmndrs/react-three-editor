import {
  CommandBarContext,
  CommandManagerContext
} from "@editable-jsx/commander"
import { Editor, EditorContext } from "@editable-jsx/editable"
import { PanelsProvider } from "@editable-jsx/panels"
import { PropsWithChildren } from "react"
import { editor } from "./editor"
import { SettingsProvider } from "./SettingsProvider"
import { ThreeFloatingProvider } from "./ThreeFloating"

export function EditorProvider({
  editor,
  children
}: {
  editor: Editor
  children: React.ReactNode
}) {
  return (
    <EditorContext.Provider value={editor}>
      <SettingsProvider>
        <CommandManagerContext.Provider value={editor.commands}>
          <CommandBarContext.Provider value={editor.commandBar}>
            <PanelsProvider manager={editor.panels}>{children}</PanelsProvider>
          </CommandBarContext.Provider>
        </CommandManagerContext.Provider>
      </SettingsProvider>
    </EditorContext.Provider>
  )
}

export function ThreeEditorProvider({ children }: PropsWithChildren) {
  return (
    <EditorProvider editor={editor}>
      <ThreeFloatingProvider>{children}</ThreeFloatingProvider>
    </EditorProvider>
  )
}
