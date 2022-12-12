import { Canvas as FiberCanvas } from "@react-three/fiber"
import React, { ComponentProps, forwardRef, useMemo } from "react"
import { EditorContext } from "../editable/contexts"
import { EditorCamera } from "./EditorCamera"
import { createEditorStore } from "../editable/store"
import { Outs } from "./Tunnels"
import { Editor } from "../editable/Editor"
import { SceneTree } from "./SceneTree"
import { EditorGizmos } from "./EditorGizmos"
import { SelectedElement } from "./SelectedElement"

import {
  transform,
  meshMaterial,
  material,
  orbitControls,
  directionalLight
} from "./plugins"

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
    () =>
      new Editor(createEditorStore(), [
        transform,
        meshMaterial,
        material,
        orbitControls,
        directionalLight
      ]),
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
