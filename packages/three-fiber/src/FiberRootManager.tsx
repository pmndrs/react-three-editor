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
import { UseBoundStore } from "zustand"

type PrevFrameLoop = null | "always" | "demand" | "never"

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

  const [store] = useState({
    prevFrameloop: null as PrevFrameLoop,
    prevElapsedTime: 0
  })

  useLayoutEffect(() => {
    for (const [key, root] of _roots) {
      if (key !== editor.canvas) continue

      const appState = root.store.getState()
      const editorState = editor.editorRoot!.store.getState()

      if (isEditorMode) {
        // Suspend app root
        store.prevFrameloop = appState.frameloop
        appState.set({
          frameloop: "never",
          internal: { ...appState.internal, active: false }
        })
        store.prevElapsedTime = appState.clock.getElapsedTime()
        appState.clock.stop()
        appState.setEvents({ enabled: false })

        // Enable editor root
        editorState.set({
          frameloop: "always",
          internal: { ...editorState.internal, active: true }
        })
      } else {
        // Enable app root
        if (store.prevFrameloop !== null) {
          appState.set({
            frameloop: store.prevFrameloop,
            internal: { ...appState.internal, active: true }
          })
          appState.clock.start()
          appState.clock.elapsedTime = store.prevElapsedTime
          appState.setEvents({ enabled: true })
        }

        // Suspend editor root
        editorState.set({
          frameloop: "never",
          internal: { ...editorState.internal, active: false }
        })
      }
    }
  }, [editor, isEditorMode, store])

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
