import { FC } from "react"
import { useCommands } from "../commandbar/useCommands"

export const UICommands: FC = () => {
  useCommands(() => [
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
  ])
  return null
}
