import { FC, useEffect } from "react"
import { useEditor } from "../../editable"
import { CommandType } from "../types"
import { BufferGeometry, Material, Object3D } from "three"
import * as THREE from "three"
import { ComponentType } from "../../component-loader"

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

export const InsertElementsSubCommands: FC = () => {
  const editor = useEditor()
  useEffect(() => {
    const commands: CommandType[] = possibleItemsToAdd.map((component: any) => {
      return {
        name: component.name,
        type: "command",
        parentId: "insert-element"
      }
    })
    editor.commands.registerCommands(commands)
    return () => {
      editor.commands.unregisterCommands(commands)
    }
  }, [editor])

  useEffect(() => {
    return editor.loader.store.subscribe(
      (components: ComponentType[]) => {
        console.log(components)
        const commands = components.map((component): CommandType => {
          return {
            name: component.name,
            type: "command",
            parentId: "insert-element",
            async execute(_editor) {
              const importedModule = await import(
                /* @vite-ignore */ component.importPath
              )
              if (importedModule[component.name]) {
                _editor.appendNewElement(
                  _editor.selectedElement ?? _editor.root,
                  importedModule[component.name]
                )
              }
            }
          }
        })
        editor.commands.registerCommands(commands)
      },
      ({ components }) => components
    )
  }, [editor.commands, editor.loader.store])

  return null
}
