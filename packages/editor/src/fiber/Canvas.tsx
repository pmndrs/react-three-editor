import { Canvas as FiberCanvas, Props } from "@react-three/fiber"
import { forwardRef, Suspense } from "react"
import { Toaster } from "react-hot-toast"
import { CommandBar } from "../commandbar"
import { AllCommands } from "../commandbar/commands"
import { EditableElementContext, EditorContext, useEditor } from "../editable"
import { JSXSource } from "../types"
import { Outs } from "../ui/tunnel"
import { createMultiTunnel } from "../ui/tunnels"
import { CameraBounds } from "./CameraBounds"
import { EditorCamera } from "./controls/EditorCamera"
import { EditorControls } from "./controls/EditorControls"
import { EditorPanels } from "./controls/EditorPanels"
import { editor } from "./editor"
import { PanelGroup } from "./PanelGroup"
export const editorTunnel = createMultiTunnel()
export const Editor = editorTunnel.In
export type CanvasProps = Props & { _source: JSXSource }

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  (props, ref) => {
    // @ts-ignore
    window.editor = editor

    return (
      <div
        style={{
          display: "contents"
        }}
      >
        <EditorContext.Provider value={editor}>
          <AllCommands />
          <EditorPanels />
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
      </div>
    )
  }
)

const EditorCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  function EditorCanvas(props, ref) {
    const store = useEditor()
    const [settings] = store.useSettings("scene", {
      shadows: {
        value: true
      }
    })

    const [editableElement, { children, ...overrideProps }] = editor.useElement(
      "canvas",
      {
        ...props,
        id: "root"
      }
    )

    editableElement.index = "0"
    editor.rootId = editableElement.id
    return (
      <FiberCanvas
        ref={ref}
        onPointerMissed={(e: any) => {
          store.clearSelection()
        }}
        {...overrideProps}
        {...settings}
      >
        <EditorContext.Provider value={store}>
          <EditorCamera />
          <CameraBounds>
            <Suspense>
              <EditableElementContext.Provider value={editableElement}>
                {children}
              </EditableElementContext.Provider>
            </Suspense>
          </CameraBounds>
          <editorTunnel.Outs fallback={<EditorControls />} />
        </EditorContext.Provider>
      </FiberCanvas>
    )
  }
)
