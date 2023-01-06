import {
  context,
  RootState,
  useFrame,
  useStore,
  useThree,
  _roots
} from "@react-three/fiber"
import React, { useLayoutEffect, useRef, useState } from "react"
import { useEditor } from "@editable-jsx/editable"
import { ThreeEditor } from "./ThreeEditor"
import { createEditorRoot, Root } from "./root/createEditorRoot"
import { resumeRoot, suspendRoot } from "./root/rootControls"

export function FiberRootManager({ children }: { children: React.ReactNode }) {
  const editor = useEditor<ThreeEditor>()
  const [dummy] = useState(() => {
    const el = document.createElement("div")
    document.body.appendChild(el)
    return el
  })

  // This guarantees the editor root is ready right away for the context provider.
  for (const [key, root] of _roots) {
    if (key !== editor.canvas) continue
    const _editorRoot = createEditorRoot(dummy, root)
    if (_editorRoot) editor.editorRoot = _editorRoot
    editor.appRoot = root
  }

  useLayoutEffect(() => {
    if (!editor.editorRoot) return
    const editorState = editor.editorRoot.store.getState()

    if (editorState.events?.connect) {
      editorState.events.connect(
        editorState.gl.domElement.parentElement?.parentElement
      )
    }
    console.log(editorState.events)
  }, [editor])

  return (
    editor.editorRoot && (
      <context.Provider value={editor.editorRoot.store}>
        <LoopManager />
        {children}
      </context.Provider>
    )
  )
}

function LoopManager() {
  const editor = useEditor<ThreeEditor>()
  const isEditorMode = editor.useStates("editing")

  useLayoutEffect(() => {
    for (const [key, root] of _roots) {
      if (key !== editor.canvas) continue

      if (isEditorMode) {
        suspendRoot(root)
        if (editor.editorRoot) resumeRoot(editor.editorRoot)
      } else {
        resumeRoot(root)
        if (editor.editorRoot) suspendRoot(editor.editorRoot)
      }
    }
  }, [editor, isEditorMode])

  useFrame(({ scene, gl, camera }) => {
    gl.render(scene, camera)
  }, 1)

  return null
}

export function AppRootProvider({ children }: { children: React.ReactNode }) {
  const editor = useEditor<ThreeEditor>()
  return (
    editor.appRoot && (
      <context.Provider value={editor.appRoot.store}>
        {children}
      </context.Provider>
    )
  )
}
