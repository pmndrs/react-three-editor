import { EditableContext, EditorContext, useEditor } from "@editable-jsx/core"
import { Canvas as FiberCanvas } from "@react-three/fiber"
import { forwardRef, Suspense } from "react"
import { CameraBounds } from "./CameraBounds"
import { CanvasProps, editorTunnel } from "./Canvas"
import { EditorCamera } from "./controls/EditorCamera"
import { EditorControls } from "./controls/EditorControls"
import { editor } from "./editor"

export const EditableCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  function EditableCanvas(props, ref) {
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
              <EditableContext.Provider value={editableElement}>
                {children}
              </EditableContext.Provider>
            </Suspense>
          </CameraBounds>
          <editorTunnel.Outs fallback={<EditorControls />} />
        </EditorContext.Provider>
      </FiberCanvas>
    )
  }
)
