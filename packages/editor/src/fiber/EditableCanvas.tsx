import { Canvas as FiberCanvas } from "@react-three/fiber"
import "cmdk/dist/"
import { ComponentProps, forwardRef, useMemo } from "react"
import { client } from "../vite/client"
import { DEFAULT_EDITOR_PLUGINS } from "./plugins"
import { ThreeEditor } from "./ThreeEditor"
import { createMultiTunnel } from "./Tunnels"
export const editorTunnel = createMultiTunnel()

import { DrafterProvider } from "draft-n-draw"
import { EditorContext } from "../editable/Editor"
import { Outs } from "./CanvasTunnel"
import { CommandBar } from "./CommandBar"
import { EditorCamera } from "./EditorCamera"
import { CameraGizmos } from "./EditorGizmos"
import { Panel } from "./Panel"
import { PerformanceControls } from "./PerfControls"
import { SceneControls } from "./SceneTree"
import { SelectedElementControls } from "./SelectedElement"
import "./style.css"
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
