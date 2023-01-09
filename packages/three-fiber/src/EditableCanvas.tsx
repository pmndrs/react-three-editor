import { EditableRootProvider, useEditor } from "@editable-jsx/editable"
import { JSXSource, mergeRefs } from "@editable-jsx/state"
import { Canvas as FiberCanvas, Props } from "@react-three/fiber"
import { FiberProvider } from "its-fine"
import { forwardRef, PropsWithChildren, Suspense } from "react"
import { EditorControls as DefaultEditorControls } from "./controls/EditorControls"
import { EditableThreeRoot } from "./EditableThreeRoot"
import { EditorBounds } from "./EditorBounds"
import { EditorUI } from "./EditorUI"
import { AppRootProvider, FiberRootManager } from "./FiberRootManager"
import { ThreeTunnel } from "./ThreeTunnel"

export type CanvasProps = Props & { _source?: JSXSource }

export const EditableCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  function EditorCanvas(props, ref) {
    const editor = useEditor()

    const [editableRoot, { children, ...canvasProps }] =
      editor.document.useRoot<EditableThreeRoot>(EditableThreeRoot, props, ref)

    console.log(canvasProps)

    return (
      <FiberCanvas
        {...canvasProps}
        ref={mergeRefs([
          canvasProps.ref,
          (el) => {
            editableRoot.canvas = el
          }
        ])}
      >
        <EditableThreeProvider editableRoot={editableRoot}>
          {children}
        </EditableThreeProvider>
      </FiberCanvas>
    )
  }
)

function EditableThreeProvider({
  children,
  editableRoot
}: PropsWithChildren<{ editableRoot: EditableThreeRoot }>) {
  return (
    <EditableRootProvider root={editableRoot}>
      <FiberRootManager>
        {/** drei's Bounds component to be able to focus on elements */}
        <EditorBounds>
          <Suspense>
            <FiberProvider>
              <AppRootProvider>{children}</AppRootProvider>
            </FiberProvider>
          </Suspense>
        </EditorBounds>

        {/** Used by editor elements that need to live inside the R3F provider/scene */}
        <ThreeTunnel.Out />

        {/*
         * Editor UI. This can be overriden by using the EditorUI.In component
         * in your app to override the default UI.
         */}
        <EditorUI.Out fallback={<DefaultEditorControls />} />
      </FiberRootManager>
    </EditableRootProvider>
  )
}
