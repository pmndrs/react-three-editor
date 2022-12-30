import { Canvas as FiberCanvas, Props } from "@react-three/fiber"
import { FiberProvider } from "its-fine"
import * as React from "react"
import { forwardRef, Suspense } from "react"
import { Toaster } from "react-hot-toast"
import { CommandBar } from "../commandbar"
import { AllCommands } from "../commandbar/commands"
import { EditableElementContext, EditorContext, useEditor } from "../editable"
import { JSXSource } from "../types"
import { Outs } from "../ui/tunnel"
import { createMultiTunnel } from "../ui/tunnels"
import { CameraBounds } from "./CameraBounds"
import { ComponentsTray } from "./ComponentsTray"
import { EditorCamera } from "./controls/EditorCamera"
import { EditorControls } from "./controls/EditorControls"
import { EditorPanels } from "./controls/EditorPanels"
import { editor } from "./editor"
import { PanelGroup } from "./PanelGroup"
import { useContextBridge } from "./useContextBridge"
import { ScreenshotCanvas } from "./useScreenshotStore"
export const editorTunnel = createMultiTunnel()
export const Editor = editorTunnel.In
export type CanvasProps = Props & { _source: JSXSource }

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  (props, ref) => {
    // @ts-ignore
    window.editor = editor

    return (
      <EditorContext.Provider value={editor}>
        <EditorPanels />
        <AllCommands />
        <ScreenshotCanvas />
        <ComponentsTray />
        <div
          style={{
            display: "flex",
            height: "100vh",
            flexDirection: "row",
            width: "100vw"
          }}
        >
          <PanelGroup side="left" />
          <EditorCanvas {...props} ref={ref} />
          <PanelGroup side="right" />
        </div>
        <CommandBar />
        <Outs />
        <Toaster />
      </EditorContext.Provider>
    )
  }
)

const EditorCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  function EditorCanvas(props, ref) {
    const editor = useEditor()
    const canvasSettings = editor.useSettings("scene", {
      shadows: {
        value: true
      }
    })

    const [editableElement, { children, ...canvasProps }] = editor.useElement(
      "canvas",
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
                <Root editableElement={editableElement}>{children}</Root>
              </FiberProvider>
            </Suspense>
          </CameraBounds>
          <editorTunnel.Outs fallback={<EditorControls />} />
        </EditorContext.Provider>
      </FiberCanvas>
    )
  }
)

export function Root({ children, editableElement }) {
  const ContextBridge = useContextBridge()

  React.useLayoutEffect(() => {
    editableElement.index = "0"
    editor.rootId = editableElement.id
  }, [editableElement])

  return (
    <EditableElementContext.Provider value={editableElement}>
      {children}
    </EditableElementContext.Provider>
  )
}

export function EditorRoot({ children, _source }) {
  const ContextBridge = useContextBridge()
  const [editableElement, props] = editor.useElement("canvas", {
    id: "root11",
    _source,
    children
  })

  React.useLayoutEffect(() => {
    editableElement.index = "0"
    editor.rootId = editableElement.id
  }, [editableElement])
  editor.ContextBridge = ContextBridge

  return (
    <EditableElementContext.Provider value={editableElement}>
      {props.children}
    </EditableElementContext.Provider>
  )
}
