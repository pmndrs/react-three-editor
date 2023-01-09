import { useEditableRoot, useEditor } from "@editable-jsx/editable"
import { context, useFrame, _roots } from "@react-three/fiber"
import React, { useLayoutEffect, useState } from "react"
import { EditableThreeRoot } from "./EditableThreeRoot"
import { createEditorRoot } from "./root/createEditorRoot"
import { resumeRoot, suspendRoot } from "./root/rootControls"

export function FiberRootManager({ children }: { children: React.ReactNode }) {
  const editor = useEditableRoot<EditableThreeRoot>()
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
  const editableRoot = useEditableRoot<EditableThreeRoot>()
  const editor = useEditor()

  const isEditorMode = editor.useStates("editing")

  useLayoutEffect(() => {
    for (const [key, root] of _roots) {
      if (key !== editableRoot.canvas) continue

      if (isEditorMode) {
        suspendRoot(root)
        resumeRoot(editableRoot.editorRoot!)
      } else {
        resumeRoot(root)
        suspendRoot(editableRoot.editorRoot!)
      }
    }
  }, [editableRoot, isEditorMode])

  useFrame(({ scene, gl, camera }) => {
    gl.render(scene, camera)
  }, 1)

  return null
}

export function AppRootProvider({ children }: { children: React.ReactNode }) {
  const editor = useEditableRoot<EditableThreeRoot>()
  return (
    editor.appRoot && (
      <context.Provider value={editor.appRoot.store}>
        {children}
      </context.Provider>
    )
  )
}
