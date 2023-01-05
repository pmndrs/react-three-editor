import { useCommands } from "@editable-jsx/commander"
import { Editor } from "@editable-jsx/editable"
import { FC } from "react"

export const UICommands: FC = () => {
  useCommands<Editor>(() => [
    {
      name: "clear-selection",
      description: "Clear selection",
      type: "command",
      execute(editor) {
        editor.clearSelection()
      }
    },
    {
      name: "open-command-palette",
      description: "Open command palette",
      type: "command",
      shortcut: ["meta", "k"],
      execute(editor) {
        editor.commandBar.toggle()
      }
    },
    {
      name: "show-panels",
      description: "Show panels",
      type: "command",
      execute(editor) {
        editor.panels.showAllPanels()
      }
    },
    {
      name: "hide-panels",
      description: "Hide panels",
      type: "command",
      execute(editor) {
        editor.panels.hideAllPanels()
      }
    },
    {
      name: "show-dynamic-island",
      description: "Show Dynamic Island",
      type: "command",
      execute(editor) {
        editor.settings.set({ "panels.island.hidden": false })
      }
    },
    {
      name: "hide-dynamic-island",
      description: "Hide Dynamic Island",
      type: "command",
      execute(editor) {
        editor.settings.set({ "panels.island.hidden": true })
      }
    }
  ])
  return null
}
