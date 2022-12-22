import { forwardRef, Fragment, PropsWithChildren, useMemo } from "react"
import { createMultiTunnel } from "./tunnels"
import { CanvasProps, Canvas as FiberCanas } from "@react-three/fiber"
import { Editor as ThreeEditor, EditorContext } from "../editable"
import { client } from "../vite/client"
import { CommandBar, CommandBarControls } from "../commandbar"
import "leva"
import { AllCommands } from "../commandbar/commands"
import { CameraGizmos, EditorCamera, Panel, SceneControls } from "../components"

export const editorTunnel = createMultiTunnel()
export const { In, Outs } = createMultiTunnel()

export const Editor = editorTunnel.In

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ children, ...props }, forwardedRef) => {
    const store = useMemo(() => new ThreeEditor(client), [])
    return (
      <EditorContext.Provider value={store}>
        <AllCommands />
        <EditorCanvas ref={forwardedRef} store={store} {...props}>
          {children}
        </EditorCanvas>
        <Outs />
        <CommandBar />
      </EditorContext.Provider>
    )
  }
)

export const EditorCanvas = forwardRef<
  HTMLCanvasElement,
  PropsWithChildren<{ store: ThreeEditor }>
>(({ store, children, ...props }, forwardedRef) => {
  return (
    <FiberCanas {...props} ref={forwardedRef}>
      <EditorContext.Provider value={store}>
        {children}
        <EditorCamera />
        <editorTunnel.Outs
          fallback={
            <Fragment>
              <Panel id="default" title="properties" pos="right" width={320} />
              <Panel id="scene" title="scene" pos="left" width={320} />
              <SceneControls />
              <CommandBarControls />
              <CameraGizmos />
            </Fragment>
          }
        />
      </EditorContext.Provider>
    </FiberCanas>
  )
})
