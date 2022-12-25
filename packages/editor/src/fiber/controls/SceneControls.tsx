import { useControls } from "leva"
import { StoreType } from "leva/dist/declarations/src/types"
import { useEditor } from "../../editable"
import { tree } from "../../ui/leva/tree/tree"
import { usePanel } from "../../ui/Panel"

export function SceneControls({
  store = "scene",
  order
}: {
  store?: StoreType | string
  order?: number
}) {
  const editor = useEditor()
  const panel = usePanel(store)
  const [p] = editor.store((state) => [state.elements[editor.rootId]])
  const items: Record<string, any> = {}
  p?.children.forEach((v) => {
    items[v.id] = v
  })

  useControls(
    {
      scene: tree({
        items,
        scrollable: false,
        order: order
      })
    },
    { store: panel.store },
    [items, order]
  )

  return null
}
