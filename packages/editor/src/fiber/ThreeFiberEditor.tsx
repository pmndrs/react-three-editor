import { CommandBar } from "@editable-jsx/commander"
import { PanelContainer, PanelGroup } from "@editable-jsx/panels"
import { createMultiTunnel, Floating, Toaster } from "@editable-jsx/ui"
import { forwardRef } from "react"
import { AllCommands } from "../commands"
import { ComponentsTray } from "./ComponentsTray"
import { EditorPanels } from "./controls/EditorPanels"
import { CanvasProps, EditableCanvas } from "./EditableCanvas"
import { editor } from "./editor"
import { ThreeEditorProvider } from "./ThreeEditorProvider"
import { ScreenshotCanvas } from "./useScreenshotStore"

export const EditorUI = createMultiTunnel()

export const EditorCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  (props, ref) => {
    return (
      <ThreeEditorProvider editor={editor}>
        {/* Registers all the commands: keyboard shortcuts & command palette */}
        <AllCommands />

        {/* Panels active in the editor */}
        <EditorPanels />

        {/* Editor layout and the Canvas in the middle */}
        <PanelContainer>
          <PanelGroup side="left" />
          <EditableCanvas {...props} ref={ref} />
          <PanelGroup side="right" />
        </PanelContainer>

        {/* Tray of user component library to pick and place entities */}
        <ComponentsTray />

        {/* Command bar dialog */}
        <CommandBar.Out />

        {/* Floating UI, panels, bottom bar */}
        <Floating.Out />

        {/* Toaster for alerts */}
        <Toaster />

        {/* Headless canvas for screenshots */}
        <ScreenshotCanvas />
      </ThreeEditorProvider>
    )
  }
)
