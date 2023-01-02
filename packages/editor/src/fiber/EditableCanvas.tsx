import { EditableContext, EditorContext, useEditor } from "@editable-jsx/core"
import { Canvas as FiberCanvas } from "@react-three/fiber"
import { forwardRef, Suspense } from "react"
import { CanvasProps, EditorUI } from "./Canvas"
import { EditorCamera } from "./controls/EditorCamera"
import { EditorControls } from "./controls/EditorControls"
import { editor } from "./editor"
import { EditorBounds } from "./EditorBounds"

export const EditableCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  function EditableCanvas(props, ref) {
    const store = useEditor()
    const settings = store.useSettings("scene", {
      shadows: {
        value: true
      }
    })

    const [editableElement, { children, ...overrideProps }] = editor.useElement(
      "root",
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
          <EditorBounds>
            <Suspense>
              <EditableContext.Provider value={editableElement}>
                {children}
              </EditableContext.Provider>
            </Suspense>
          </EditorBounds>
          <EditorUI.Out fallback={<EditorControls />} />
        </EditorContext.Provider>
      </FiberCanvas>
    )
  }
)
