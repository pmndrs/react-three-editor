import { folder, useControls } from "leva"
import { tree } from "../editable/controls/tree/tree"
import { useEditorStore } from "../editable/Editor"

export function SceneTree() {
  const p = useEditorStore((state) => Object.values(state.elements))

  useControls(() => {
    const items: Record<string, any> = {}
    p.forEach((v) => {
      if (v.parentId == null) items[v.id] = v
    })

    return {
      scene: folder(
        {
          graph: tree({
            items
          })
        },
        {
          order: -2
        }
      )
    }
  }, [p])
  return null
}
