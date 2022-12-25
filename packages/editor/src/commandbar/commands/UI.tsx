import { FC, useEffect } from "react"
import { useEditor } from "../../editable"
import { CommandType } from "../types"

export const UICommands: FC = () => {
  const editor = useEditor()
  useEffect(() => {
    const commands: CommandType[] = [
      {
        name: "show-panels",
        description: "Show panels",
        execute(editor) {
          editor.showAllPanels()
        }
      },
      {
        name: "hide-panels",
        description: "Hide panels",
        execute(editor) {
          editor.hideAllPanels()
        }
      }
    ]
    editor.commands.registerCommands(commands)
    return () => {
      editor.commands.unregisterCommands(commands)
    }
  }, [editor])
  return null
}
