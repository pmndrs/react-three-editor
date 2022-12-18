import { Canvas as FiberCanvas } from "@react-three/fiber"
import "cmdk/dist/"
import { DrafterProvider } from "draft-n-draw"
import { ComponentProps, forwardRef, useMemo } from "react"
import { EditorContext } from "../editable/Editor"
import { client } from "../vite/client"
import { CameraGizmos } from "./controls/CameraGizmos"
import { CommandBar } from "./controls/CommandBar/CommandBar"
import { EditorCamera } from "./controls/EditorCamera"
import { Panel } from "./controls/Panel"
import { PerformanceControls } from "./controls/PerformanceControls"
import { SceneControls } from "./controls/SceneControls"
import { SelectedElementControls } from "./controls/SelectedElementControls"
import { createMultiTunnel } from "./controls/tunnels"
import { DEFAULT_EDITOR_PLUGINS } from "./plugins"
import { ThreeEditor } from "./ThreeEditor"

export const editorTunnel = createMultiTunnel()

export const { In, Outs } = createMultiTunnel()

export const Editor = editorTunnel.In

export const Canvas = forwardRef<
  HTMLCanvasElement,
  ComponentProps<typeof FiberCanvas>
>(function Canvas({ children, ...props }, ref) {
  const store = useMemo(
    () => new ThreeEditor(DEFAULT_EDITOR_PLUGINS, client),
    []
  )

  // store.settingsPanel = levaStore

  // @ts-ignore
  window.editor = store

  return (
    <>
      <FiberCanvas
        ref={ref}
        onPointerMissed={(e) => {
          store.clearSelection()
        }}
        {...props}
      >
        <DrafterProvider>
          <EditorContext.Provider value={store}>
            <EditorCamera />
            {children}
            <editorTunnel.Outs
              fallback={
                <>
                  <Panel title="scene" />
                  <SceneControls store="scene" />
                  <SelectedElementControls store="default" />
                  <PerformanceControls store="scene" />
                  <CameraGizmos />
                </>
              }
            />
          </EditorContext.Provider>
        </DrafterProvider>
      </FiberCanvas>
      <Outs />
      <CommandBar />
    </>
  )
})
