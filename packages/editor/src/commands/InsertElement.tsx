import { useEditor } from "@editable-jsx/core"
import { FC, useEffect } from "react"
import * as THREE from "three"
import { BufferGeometry, Material, Object3D } from "three"
import { CommandType } from "../commandbar/types"
import { useCommands } from "../commandbar/useCommands"
import { ComponentType } from "../component-loader"

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
  useCommands(() => {
    return possibleItemsToAdd.map((component: any) => {
      return {
        name: component.name,
        type: "command",
        parentId: "insert-element"
      }
    })
  })

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
