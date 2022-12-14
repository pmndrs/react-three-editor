import { Canvas as FiberCanvas } from "@react-three/fiber"
import React, { ComponentProps, forwardRef, useMemo } from "react"
import { EditorCamera } from "./EditorCamera"
import { Outs } from "./Tunnels"
import { SceneTree } from "./SceneTree"
import { EditorGizmos } from "./EditorGizmos"
import { SelectedElement } from "./SelectedElement"
import { DEFAULT_EDITOR_PLUGINS } from "./plugins"
import { ThreeEditor } from "./ThreeEditor"
import { EditorContext } from "../editable/Editor"
import { client } from "../vite/client"
import { useControls } from "leva"

export const Canvas = forwardRef<
  HTMLCanvasElement,
  ComponentProps<typeof FiberCanvas> & { editor?: React.ReactNode }
>(function Canvas(
  {
    children,
    editor = (
      <>
        <SceneTree />
        <SelectedElement />
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
