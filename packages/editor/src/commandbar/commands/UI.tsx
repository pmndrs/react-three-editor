import { FC, useEffect } from "react"
import { useEditor } from "../../editable"
import { CommandType } from "../types"

export const UICommands: FC = () => {
  const editor = useEditor()
  useEffect(() => {
    const commands: CommandType[] = [
      {
        name: "clear-selection",
        description: "Clear selection",
        type: "command",
        execute(editor) {
          editor.clearSelection()
        }
      },
      {
        name: "show-panels",
        description: "Show panels",
        type: "command",
        execute(editor) {
          editor.showAllPanels()
        }
      },
      {
        name: "hide-panels",
        description: "Hide panels",
        type: "command",
        execute(editor) {
          editor.hideAllPanels()
        }
      },
      {
        name: "show-dynamic-island",
        description: "Show Dynamic Island",
        type: "command",
        execute(editor) {
          editor.setSetting("panels.island.hidden", false)
        }
      },
      {
        name: "hide-dynamic-island",
        description: "Hide Dynamic Island",
        type: "command",
        execute(editor) {
          editor.setSetting("panels.island.hidden", true)
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
