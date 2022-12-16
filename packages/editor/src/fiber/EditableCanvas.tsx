import { Canvas as FiberCanvas } from "@react-three/fiber"
import { useControls } from "leva"
import { ComponentProps, forwardRef, useMemo } from "react"
import { EditorContext } from "../editable/Editor"
import { client } from "../vite/client"
import { Outs } from "./CanvasTunnel"
import { EditorCamera } from "./EditorCamera"
import { CameraGizmos } from "./EditorGizmos"
import { DEFAULT_EDITOR_PLUGINS } from "./plugins"
import { SceneControls } from "./SceneTree"
import { SelectedElementControls } from "./SelectedElement"
import { ThreeEditor } from "./ThreeEditor"
import { createMultiTunnel } from "./Tunnels"

export const editorTunnel = createMultiTunnel()

export const Editor = editorTunnel.In

export const Canvas = forwardRef<
  HTMLCanvasElement,
  ComponentProps<typeof FiberCanvas>
>(function Canvas({ children, ...props }, ref) {
  const store = useMemo(
    () => new ThreeEditor(DEFAULT_EDITOR_PLUGINS, client),
    []
  )

  useControls("editor", {}, { collapsed: true })
  return (
    <>
      <FiberCanvas
        ref={ref}
        onPointerMissed={(e) => {
          console.log("heree")
          store.store.setState(() => ({
            selectedId: null
          }))
        }}
        {...props}
      >
        <EditorContext.Provider value={store}>
          <EditorCamera />
          {children}
          <editorTunnel.Outs
            fallback={
              <>
                <SceneControls />
                <SelectedElementControls />
                <CameraGizmos />
              </>
            }
          />
        </EditorContext.Provider>
      </FiberCanvas>
      <Outs />
    </>
  )
})
