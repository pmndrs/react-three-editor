import { CommandType, useCommands } from "@editable-jsx/commander"
import { Editor, useEditor } from "@editable-jsx/editable"
import { ComponentType } from "@editable-jsx/editable/src/component-loader"
import { FC, useEffect } from "react"
import * as THREE from "three"
import { BufferGeometry, Material, Object3D } from "three"

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
  useCommands<Editor>(() => {
    return possibleItemsToAdd.map((component: any) => {
      return {
        name: component.name,
        type: "command",
        parentId: "insert-element",
        async execute(_editor) {
          _editor.appendNewElement(
            _editor.selectedElement ?? _editor.root,
            component.name.charAt(0).toLowerCase() + component.name.slice(1),
            {}
          )
        }
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
