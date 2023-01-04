import { useEditor } from "@editable-jsx/core"
import { JSXSource } from "@editable-jsx/state"
import { Canvas as FiberCanvas, Props } from "@react-three/fiber"
import { FiberProvider } from "its-fine"
import { forwardRef, Suspense } from "react"
import { EditorControls } from "./controls/EditorControls"
import { EditorBounds } from "./EditorBounds"
import { EditorRoot } from "./EditorRoot"
import { EditorUI } from "./ThreeFiberEditor"
import { ThreeTunnel } from "./ThreeTunnel"

export type CanvasProps = Props & { _source?: JSXSource }

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
