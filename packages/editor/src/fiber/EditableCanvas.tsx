import { Canvas as FiberCanvas } from "@react-three/fiber"
import React, { ComponentProps, forwardRef, useMemo } from "react"
import { EditorContext } from "../editable/Editor"
import { client } from "../vite/client"
import { EditorCamera } from "./EditorCamera"
import { EditorGizmos } from "./EditorGizmos"
import { DEFAULT_EDITOR_PLUGINS } from "./plugins"
import { SceneTree } from "./SceneTree"
import { SelectedElement } from "./SelectedElement"
import { ThreeEditor } from "./ThreeEditor"
import { Outs } from "./Tunnels"

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
