import { FC, useEffect } from "react"
import * as THREE from "three"
import { BufferGeometry, Group, Material, Mesh, Object3D } from "three"
import { EditableElement, useEditor } from "../../editable"
import { ThreeEditor } from "../../fiber/ThreeEditor"
import { CommandType } from "../types"

function isClass(v: any) {
  return typeof v === "function" && /^\s*class\s+/.test(v.toString())
}

const possibleItemsToAdd = Object.values(THREE)
  .filter(isClass)
  .filter(
    (c: any) =>
      c.prototype instanceof Object3D ||
      c.prototype instanceof Material ||
      c.prototype instanceof BufferGeometry
  )

export const EditorCommands: FC = () => {
  const editor = useEditor()
  useEffect(() => {
    const commands: CommandType[] = [
      {
        name: "toggle-play-mode",
        description(editor) {
          const mode = editor.useMode("editor")
          return `Go to ${mode ? "Play" : "Editor"} mode`
        },
        shortcut: ["meta", "e"],
        execute(editor) {
          const mode = editor.useMode("editor")
          if (!mode) {
            editor.settingsPanel.set({ "world.mode": "editor" }, false)
          } else {
            editor.settingsPanel.set({ "world.mode": "play" }, false)
          }
        }
      },
      {
        name: "isolate",
        description: "Isolate element",
        shortcut: ["meta", "f"],
        execute(editor) {
          let el = editor.root
          let selectedElement = editor.selectedElement
          let selected = selectedElement?.treeId

          function show(c: EditableElement) {
            if (c.ref instanceof Mesh || c.ref instanceof Group) {
              c.visible = true
            } else {
              for (var d of c.children) {
                show(d)
              }
            }
          }

          function hide(c: EditableElement) {
            if (c.ref instanceof Mesh || c.ref instanceof Group) {
              c.visible = false
            } else {
              for (var d of c.children) {
                hide(d)
              }
            }
          }

          function focus(c: EditableElement, selected: string) {
            if (!selected.startsWith(c.treeId)) {
              hide(c)
            } else if (selected === c.treeId) {
            } else {
              for (var d of c.children) {
                focus(d, selected)
              }
            }
          }

          if (selected) {
            show(el)
            for (var child of el.children) {
              focus(child, selected)
            }
          }
          ;(editor as ThreeEditor).bounds.refresh(selectedElement?.ref).fit()
        }
      },
      {
        name: "save-selected-element",
        description: "Save selected element",
        execute(editor) {
          editor.selectedElement?.save()
        }
      },
      {
        name: "clear-local-storage",
        description: "Clear local storage",
        execute(editor) {
          localStorage.clear()
        }
      },
      {
        name: "insert-element",
        description: "Insert element into the scene",
        children: possibleItemsToAdd.map((klass: any) => {
          return {
            name: `${klass.name}`,
            execute(editor) {
              editor.appendNewElement(
                editor.selectedElement!,
                klass.name[0].toLowerCase() + klass.name.slice(1)
              )
            }
          }
        })
      },
      {
        name: "remove-element",
        description: "Remove element from the scene"
      }
    ]
    editor.commands.registerCommands(commands)
    return () => {
      editor.commands.unregisterCommands(commands)
    }
  }, [editor])
  return null
}
