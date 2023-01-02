import {
  CommandBar,
  CommandBarContext,
  CommandManagerContext
} from "@editable-jsx/commander"
import {
  createMultiTunnel,
  Floating,
  JSXSource,
  SettingsContext,
  Toaster
} from "@editable-jsx/controls"
import { EditorContext, useEditor } from "@editable-jsx/core"
import { PanelGroup, PanelManagerContext } from "@editable-jsx/panels"
import { Canvas as FiberCanvas, Props } from "@react-three/fiber"
import { FiberProvider } from "its-fine"
import { forwardRef, Suspense } from "react"
import { AllCommands } from "../commands"
import { EditorCamera } from "./controls/EditorCamera"
import { EditorControls } from "./controls/EditorControls"
import { EditorPanels } from "./controls/EditorPanels"
import { editor } from "./editor"
import { EditorBounds } from "./EditorBounds"
import { EditorRoot } from "./EditorRoot"
import { ThreeCanvas } from "./ThreeCanvas"
import { ThreeFloatingProvider } from "./ThreeFloating"

export const EditorUI = createMultiTunnel()
export type CanvasProps = Props & { _source?: JSXSource }

export const EditorCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  (props, ref) => {
    // @ts-ignore
    window.editor = editor

    return (
      <EditorProvider editor={editor}>
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
      </EditorProvider>
    )
  }
)

function EditorProvider({ editor, children }: { editor }) {
  return (
    <EditorContext.Provider value={editor}>
      <SettingsContext.Provider value={editor.settings}>
        <CommandManagerContext.Provider value={editor.commands}>
          <CommandBarContext.Provider value={editor.commandBar}>
            <PanelManagerContext.Provider value={editor.panels}>
              <ThreeFloatingProvider>
                <EditorPanels />
                {children}
                <CommandBar.Out />
                <Floating.Out />
                <Toaster />
              </ThreeFloatingProvider>
            </PanelManagerContext.Provider>
          </CommandBarContext.Provider>
        </CommandManagerContext.Provider>
      </SettingsContext.Provider>
    </EditorContext.Provider>
  )
}

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
          <EditorBounds>
            <Suspense>
              <FiberProvider>
                <EditorRoot element={editableElement}>{children}</EditorRoot>
              </FiberProvider>
            </Suspense>
          </EditorBounds>
          <ThreeCanvas.Out />
          <EditorUI.Out fallback={<EditorControls />} />
        </EditorContext.Provider>
      </FiberCanvas>
    )
  }
)
