import { Canvas as FiberCanvas } from "@react-three/fiber"
import { useControls } from "leva"
import { ComponentProps, forwardRef, ReactNode, useMemo } from "react"
import { EditorContext } from "../editable/Editor"
import { client } from "../vite/client"
import { EditorCamera } from "./EditorCamera"
import { EditorGizmos } from "./EditorGizmos"
import { DEFAULT_EDITOR_PLUGINS } from "./plugins"
import { SceneControls } from "./SceneTree"
import { SelectedElementControls } from "./SelectedElement"
import { ThreeEditor } from "./ThreeEditor"
import { Outs } from "./Tunnels"

export const Canvas = forwardRef<
  HTMLCanvasElement,
  ComponentProps<typeof FiberCanvas> & { editor?: ReactNode }
>(function Canvas(
  {
    children,
    editor = (
      <>
        <SceneControls />
        <SelectedElementControls />
        <EditorGizmos />
      </>
    ),
    ...props
  },
  ref
) {
  const store = useMemo(
    () => new ThreeEditor(DEFAULT_EDITOR_PLUGINS, client),
    []
  )

  useControls("editor", {}, { collapsed: true })
  return (
    <>
      <FiberCanvas ref={ref} {...props}>
        <EditorContext.Provider value={store}>
          <EditorCamera />
          {children}
          {editor}
        </EditorContext.Provider>
      </FiberCanvas>
      <Outs />
    </>
  )
})
