import { CommandBar } from "@editable-jsx/commander"
import { useEditor } from "@editable-jsx/editable"
import { PanelContainer, PanelGroup } from "@editable-jsx/panels"
import { JSXSource } from "@editable-jsx/state"
import { createMultiTunnel, Floating, Toaster } from "@editable-jsx/ui"
import { Canvas as FiberCanvas, Props } from "@react-three/fiber"
import { FiberProvider } from "its-fine"
import { forwardRef, Suspense } from "react"
import { AllCommands } from "./commands"
import { ComponentsTray } from "./ComponentsTray"
import { EditorControls } from "./controls/EditorControls"
import { EditorPanels } from "./controls/EditorPanels"
import { editor } from "./editor"
import { EditorBounds } from "./EditorBounds"
import { EditorRoot } from "./EditorRoot"
import { ThreeEditorProvider } from "./ThreeEditorProvider"
import { ThreeTunnel } from "./ThreeTunnel"
import { ScreenshotCanvas } from "./useScreenshotStore"

export const EditorUI = createMultiTunnel()

export type CanvasProps = Props & { _source?: JSXSource }

export const ThreeEditorCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
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

export const EditableCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  function EditorCanvas(props, ref) {
    const editor = useEditor()
    const canvasSettings = editor.useSettings("scene", {
      shadows: {
        value: true
      }
    })

    const [editableElement, { children, ...canvasProps }] = editor.useElement(
      "root",
      {
        ...props,
        id: "root"
      },
      ref
    )

    return (
      <FiberCanvas
        onPointerMissed={(e: any) => {
          editor.clearSelection()
        }}
        {...canvasProps}
        {...canvasSettings}
      >
        {/** drei's Bounds component to be able to focus on elements */}
        <EditorBounds>
          <Suspense>
            <FiberProvider>
              <EditorRoot element={editableElement}>{children}</EditorRoot>
            </FiberProvider>
          </Suspense>
        </EditorBounds>

        {/** Used by editor elements that need to live inside the R3F provider/scene */}
        <ThreeTunnel.Out />

        {/*
         * Editor UI. This can be overriden by using the EditorUI.In component
         * in your app to override the default UI.
         */}
        <EditorUI.Out fallback={<EditorControls />} />
      </FiberCanvas>
    )
  }
)
