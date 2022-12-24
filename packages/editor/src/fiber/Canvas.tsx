import { Canvas as FiberCanvas, Props } from "@react-three/fiber"
import { forwardRef } from "react"
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

export const editorTunnel = createMultiTunnel()

export const Editor = editorTunnel.In

export type CanvasProps = Props & { _source: JSXSource }
export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  (props, ref) => {
    // @ts-ignore
    window.editor = editor

    return (
      <EditorContext.Provider value={editor}>
        <AllCommands />
        <EditorCanvas {...props} ref={ref} />
        <Outs />
        <CommandBar />
        <Toaster />
      </EditorContext.Provider>
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
            <EditableElementContext.Provider value={editableElement}>
              {children}
            </EditableElementContext.Provider>
          </CameraBounds>
          <editorTunnel.Outs fallback={<EditorControls />} />
        </EditorContext.Provider>
      </FiberCanvas>
    )
  }
)
