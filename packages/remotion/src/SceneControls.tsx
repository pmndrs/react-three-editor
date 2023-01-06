import { tree, TreeElement, useEditor } from "@editable-jsx/editable"
import { usePanel } from "@editable-jsx/panels"
import { useControls } from "leva"

export function SceneControls({
  panel: store = "scene",
  order
}: {
  panel?: string
  order?: number
}) {
  const editor = useEditor()
  const panel = usePanel(store)
  const root = editor.store((state) => editor.root)

  editor.useSettings("scene", {
    fontSize: {
      value: 12,
      step: 1,
      onChange(e) {
        document.body.style.setProperty("--leva-tree-font-size", e + "px")
      }
    },
    verticalSpacing: {
      value: 0.5,
      step: 0.1,
      min: 0.1,
      max: 2,
      onChange(e) {
        document.body.style.setProperty(
          "--leva-tree-vertical-spacing",
          e + "em"
        )
      }
    }
  })

  useControls(
    {
      scene: tree({
        root,
        scrollable: false,
        order: order,
        component: TreeElement
      })
    },
    { store: panel.store },
    [root, order]
  )

  return null
}
