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
import { editor } from "./editor"
import { ResizablePanelGroup } from "./prop-types/autoSizer"
export const editorTunnel = createMultiTunnel()
export const Editor = editorTunnel.In
export const LeftPanel = createMultiTunnel()
export const RightPanel = createMultiTunnel()
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
          <EditorControls />
          <div
            style={{
              display: "flex",
              height: "100vh",
              flexDirection: "row",
              width: "100vw"
            }}
          >
            <div
              style={{
                width: "25vw",
                height: "100%",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <ResizablePanelGroup autoSaveId="left-panel" direction="vertical">
                <LeftPanel.Outs />
              </ResizablePanelGroup>
            </div>
            <EditorCanvas {...props} ref={ref} />
            <div
              style={{
                width: "25vw",
                height: "100%",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <ResizablePanelGroup
                autoSaveId="right-panel"
                direction="vertical"
              >
                <RightPanel.Outs />
              </ResizablePanelGroup>
            </div>
          </div>
          <Outs />
          <CommandBar />
          <Toaster />
        </EditorContext.Provider>
      </div>
    )
  }
)

const EditorCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  function EditorCanvas({ children, ...props }, ref) {
    const store = useEditor()
    const [settings] = store.useSettings("scene", {
      shadows: {
        value: true
      }
    })

    const [editableElement] = editor.useElement("scene", {
      _source: props._source,
      id: "root"
    })

    editableElement.index = "0"
    editor.rootId = editableElement.id
    return (
      <FiberCanvas
        ref={ref}
        onPointerMissed={(e: any) => {
          store.clearSelection()
        }}
        {...props}
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
          {/* <editorTunnel.Outs fallback={<EditorControls />} /> */}
        </EditorContext.Provider>
      </FiberCanvas>
    )
  }
)
