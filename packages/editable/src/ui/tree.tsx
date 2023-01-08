import { createPlugin, Tree, useInputContext } from "@editable-jsx/ui"
import { createContext, useEffect, useMemo, useState } from "react"
import { EditableElement } from "../EditableElement"
import { Editor } from "../Editor"
import { EditorContext } from "../EditorContext"

export const TreeContext = createContext<{
  useCollapsed(
    element: EditableElement
  ): [boolean, (collapsed: boolean) => void]
  useChildren(element: EditableElement): EditableElement[]
}>({} as any)

type TreeProps = {
  root: EditableElement
  scrollable: boolean
  editor: Editor
  component: (props: { element: EditableElement }) => JSX.Element
}

export const tree = createPlugin<TreeProps, {}, TreeProps>({
  normalize({ root, scrollable, component, editor }, path, data) {
    return { settings: { root, scrollable, component, editor }, value: {} }
  },
  component() {
    const context = useInputContext<{ settings: TreeProps }>()
    if (!context.settings.root) return null
    return <ElementTree {...context.settings} />
  }
})

function ElementTree({
  component: TreeItemComponent,
  scrollable,
  root,
  editor
}: TreeProps) {
  const memo = useMemo(() => {
    const expanded = localStorage.getItem("collapased")
      ? new Set(JSON.parse(localStorage.getItem("collapased")!))
      : new Set()
    return {
      useChildren(root: EditableElement) {
        return root.children
      },
      useCollapsed(element: EditableElement) {
        function isAnythingExpanded() {
          for (let i = 0; i < element.children.length; i++) {
            if (!expanded.has(element.children[i].treeId)) {
              return true
            }
          }
          return false
        }

        let storedCollapsedState =
          expanded.size > 0
            ? expanded.has(element.treeId)
              ? false
              : true
            : !element.ownerDocument.editor.isSelected(element) &&
              element.isPrimitive()

        const [collapsed, setCollapsed] = useState(storedCollapsedState)

        useEffect(() => {
          if (collapsed) {
            expanded.delete(element.treeId)
            localStorage.setItem(
              "collapased",
              JSON.stringify(Array.from(expanded))
            )
          } else {
            expanded.add(element.treeId)
            localStorage.setItem(
              "collapased",
              JSON.stringify(Array.from(expanded))
            )
          }
        }, [collapsed])

        return [collapsed, setCollapsed] as [
          boolean,
          (collapsed: boolean) => void
        ]
      }
    }
  }, [])
  const children = memo.useChildren(root)

  return (
    <EditorContext.Provider value={editor}>
      <TreeContext.Provider value={memo}>
        <Tree scrollable={scrollable}>
          {children.map((child) => (
            <TreeItemComponent element={child} key={child.id} />
          ))}
        </Tree>
      </TreeContext.Provider>
    </EditorContext.Provider>
  )
}
