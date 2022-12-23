import { FC, useEffect } from "react"
import { useEditor } from "../../editable"
import { CommandType } from "../types"
import * as THREE from "three"
import { BufferGeometry, LightShadow, Material, Object3D } from "three"

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
          return `Go to ${editor.isEditorMode() ? "Play" : "Editor"} mode`
        },
        execute(editor) {}
      },
      {
        name: "isolate",
        description: "Isolate element"
      },
      {
        name: "save-selected-element",
        description: "Save selected element"
      },
      {
        name: "insert-element",
        children: possibleItemsToAdd.map((klass: any) => {
          return {
            name: `${klass.name}`
          }
        })
      },
      {
        name: "remove-element"
      }
    ]
    editor.registerCommands(commands)
    return () => {
      editor.unregisterCommands(commands)
    }
  }, [editor])
  return null
}
