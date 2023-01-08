import { useEditor } from "@editable-jsx/editable"
import { useCallback, useLayoutEffect } from "react"
import { ThreeEditor } from "./ThreeEditor"

export function ThreeEventManager() {
  const editor = useEditor<ThreeEditor>()
  //   const state = editor.useStore()

  // TODO: Make this reactive for whenever the camera changes.
  // Also, probably find a better place for it.
  // We enable all layers to see everything in edit mode.
  useLayoutEffect(() => {
    const { camera } = editor.editorRoot!.store.getState()
    camera.layers.enableAll()
  }, [editor])

  const handler = useCallback(() => {
    const { raycaster, scene, camera, pointer } =
      editor.editorRoot!.store.getState()

    raycaster.setFromCamera(pointer, camera)
    raycaster.layers.disable(editor.gizmoLayer)
    let hits = raycaster.intersectObjects(scene.children)
    hits = hits.filter((hit) => {
      if (editor.isEditable(hit.object)) return hit
    })

    if (hits.length === 0) {
      const fiberRoot = editor.getElementById("root")
      fiberRoot.dispatchEvent(new Event("pointermissed"))
      return
    }

    hits.forEach((hit) => {
      const element = editor.findEditableElement(hit.object)
      if (element)
        element.dispatchEvent(new CustomEvent("pointerup", { detail: { hit } }))
    })
  }, [editor])

  useLayoutEffect(() => {
    const state = editor.editorRoot!.store.getState()
    state.gl.domElement.addEventListener("pointerup", handler)

    return () => state.gl.domElement.removeEventListener("pointerup", handler)
  }, [editor, handler])

  return null
}
