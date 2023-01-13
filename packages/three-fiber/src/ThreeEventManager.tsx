import { useEditor } from "@editable-jsx/editable"
import { useCallback, useLayoutEffect } from "react"
import { ThreeEditableElement, ThreeEditor } from "./ThreeEditor"

type EditableHit = {
  element: ThreeEditableElement
  hit: THREE.Intersection<THREE.Object3D<THREE.Event>>
}

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
    const hits = raycaster.intersectObjects(scene.children)
    const editables = [] as EditableHit[]

    hits.forEach((hit) => {
      if (editor.isEditable(hit.object)) {
        editables.push({
          element: editor.findEditableElement(hit.object),
          hit
        })
        return
      }

      const nearestElement = editor.findNearestEditableElement(hit.object)
      if (nearestElement) editables.push({ element: nearestElement, hit })
    })

    if (editables.length === 0) {
      const fiberRoot = editor.getElementById("root")
      fiberRoot.dispatchEvent(new Event("pointermissed"))
      return
    }

    editables.forEach((editable) => {
      editable.element.dispatchEvent(
        new CustomEvent("pointerup", { detail: { hit: editable.hit } })
      )
    })
  }, [editor])

  useLayoutEffect(() => {
    const state = editor.editorRoot!.store.getState()
    state.gl.domElement.addEventListener("pointerup", handler)

    return () => state.gl.domElement.removeEventListener("pointerup", handler)
  }, [editor, handler])

  return null
}
