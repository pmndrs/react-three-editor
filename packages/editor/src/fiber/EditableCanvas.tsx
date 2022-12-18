import { Canvas as FiberCanvas } from "@react-three/fiber"
import { Command } from "cmdk"
import "cmdk/dist/"
import { ComponentProps, forwardRef, useMemo, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { client } from "../vite/client"
import { DEFAULT_EDITOR_PLUGINS } from "./plugins"
import { ThreeEditor } from "./ThreeEditor"
import { createMultiTunnel } from "./Tunnels"
export const editorTunnel = createMultiTunnel()

import { RaycastCMDK } from "./CommandBar"
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
      {/* <FiberCanvas
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
                  <SceneControls store={levaStore} />
                  <SelectedElementControls />
                  <CameraGizmos />
                </>
              }
            />
          </EditorContext.Provider>
        </DrafterProvider>
      </FiberCanvas> */}
      <CommandMenu />
      {/* <Outs /> */}
    </>
  )
})

const CommandMenu = () => {
  const [open, setOpen] = useState(false)

  // Toggle the menu when ⌘K is pressed
  useHotkeys("meta+k", () => setOpen((open) => !open))

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="commandbar"
    >
      <RaycastCMDK />
    </Command.Dialog>
  )
}
