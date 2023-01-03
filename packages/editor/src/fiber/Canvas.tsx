import { CommandBar } from "@editable-jsx/commander"
import {
  createMultiTunnel,
  Floating,
  JSXSource,
  Toaster
} from "@editable-jsx/controls"
import { PanelContainer, PanelGroup } from "@editable-jsx/panels"
import { Props } from "@react-three/fiber"
import { forwardRef } from "react"
import { AllCommands } from "../commands"
import { ComponentsTray } from "./ComponentsTray"
import { EditorPanels } from "./controls/EditorPanels"
import { EditableCanvas } from "./EditableCanvas"
import { editor } from "./editor"
import { EditorProvider } from "./EditorProvider"
import { ScreenshotCanvas } from "./useScreenshotStore"

export const EditorUI = createMultiTunnel()
export type CanvasProps = Props & { _source?: JSXSource }

export const EditorCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  (props, ref) => {
    // @ts-ignore
    window.editor = editor

    return (
      <EditorProvider editor={editor}>
        {/* Registers all the commands: keyboard shortcuts & command palette */}
        <AllCommands />

        {/* Headless canvas for screenshots */}
        <ScreenshotCanvas />

        {/* Tray of user component library to pick and place entities */}
        <ComponentsTray />

        {/* Panels active in the editor */}
        <EditorPanels />

        {/* Editor layout and the Canvas in the middle */}
        <PanelContainer>
          <PanelGroup side="left" />
          <EditableCanvas {...props} ref={ref} />
          <PanelGroup side="right" />
        </PanelContainer>

        {/* Command bar dialog */}
        <CommandBar.Out />

        {/* Floating UI, panels, bottom bar */}
        <Floating.Out />

        {/* Toaster for alerts */}
        <Toaster />
      </EditorProvider>
    )
  }
)
