import { CommandBar } from "@editable-jsx/commander"
import {
  Editor,
  EditorContext,
  EditorPanels,
  EditorProvider
} from "@editable-jsx/editable"
import { PanelRoot } from "@editable-jsx/panels"
import { Floating, Toaster } from "@editable-jsx/ui"
import { forwardRef, PropsWithChildren, useContext } from "react"
import { AllCommands as InbuiltCommands } from "./commands"
import { CanvasProps, EditableCanvas } from "./EditableCanvas"
import { editor } from "./editor"
import { ThreeFloatingProvider } from "./ThreeFloating"

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  (props, ref) => {
    const contextEditor = useContext(EditorContext)
    if (contextEditor) {
      return <EditableCanvas {...props} ref={ref} />
    } else {
      return (
        <ThreeEditorProvider editor={editor}>
          {/* Registers all the commands: keyboard shortcuts & command palette */}
          <InbuiltCommands />

          {/* Panels active in the editor */}
          <EditorPanels />

          {/* Editor layout and the Canvas in the middle */}
          <PanelRoot>
            <EditableCanvas {...props} ref={ref} />
          </PanelRoot>

          {/* Tray of user component library to pick and place entities */}
          {/* <ComponentsTray /> */}

          {/* Command bar dialog */}
          <CommandBar.Out />

          {/* Floating UI, panels, bottom bar */}
          <Floating.Out />

          {/* Toaster for alerts */}
          <Toaster />

          {/* Headless canvas for screenshots */}
          {/* <ScreenshotCanvas /> */}
        </ThreeEditorProvider>
      )
    }
  }
)

export function ThreeEditorProvider({
  children,
  editor
}: PropsWithChildren<{ editor: Editor }>) {
  return (
    <EditorProvider editor={editor}>
      <ThreeFloatingProvider>{children}</ThreeFloatingProvider>
    </EditorProvider>
  )
}
