import {
  createMultiTunnel,
  Floating,
  SettingsContext
} from "@editable-jsx/controls"
import { CommandBar, EditorContext, useEditor } from "@editable-jsx/core"
import { PanelGroup, PanelManagerContext } from "@editable-jsx/panels"
import { Canvas as FiberCanvas, Props } from "@react-three/fiber"
import { FiberProvider } from "its-fine"
import { forwardRef, Suspense } from "react"
import { Toaster } from "react-hot-toast"
import { AllCommands } from "../commands"
import { JSXSource } from "../types"
import { CameraBounds } from "./CameraBounds"
import { EditorCamera } from "./controls/EditorCamera"
import { EditorControls } from "./controls/EditorControls"
import { EditorPanels } from "./controls/EditorPanels"
import { editor } from "./editor"
import { ThreeCanvas } from "./ThreeCanvas"
import { ThreeFloatingProvider } from "./ThreeFloating"

export const editorTunnel = createMultiTunnel()
export const Editor = editorTunnel.In
export type CanvasProps = Props & { _source: JSXSource }

export const EditorCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  (props, ref) => {
    // @ts-ignore
    window.editor = editor

    return (
      <EditorContext.Provider value={editor}>
        <SettingsContext.Provider value={editor}>
          <PanelManagerContext.Provider value={editor.panels}>
            <ThreeFloatingProvider>
              <EditorPanels />
              <AllCommands />
              {/*<ScreenshotCanvas />
          <ComponentsTray /> */}
              <div
                style={{
                  display: "flex",
                  height: "100vh",
                  flexDirection: "row",
                  width: "100vw"
                }}
              >
                <PanelGroup side="left" />
                <EditableCanvas {...props} ref={ref} />
                <PanelGroup side="right" />
              </div>
              <CommandBar.Out />
              <Floating.Out />
              <Toaster />
            </ThreeFloatingProvider>
          </PanelManagerContext.Provider>
        </SettingsContext.Provider>
      </EditorContext.Provider>
    )
  }
)

const EditableCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
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
        <EditorContext.Provider value={editor}>
          <EditorCamera />
          <CameraBounds>
            <Suspense>
              <FiberProvider>
                {/* <EditorRoot element={editableElement}>{children}</EditorRoot> */}
              </FiberProvider>
            </Suspense>
          </CameraBounds>
          <ThreeCanvas.Out />
          <editorTunnel.Out fallback={<EditorControls />} />
        </EditorContext.Provider>
      </FiberCanvas>
    )
  }
)
