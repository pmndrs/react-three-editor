import { PluginItem } from "@babel/core"
import react from "@vitejs/plugin-react"
import { PluginOption } from "vite"
import { reactThreeEditorBabel } from "./babel"
import { editor } from "./server"

export const r3f = ({
  babelPlugins = []
}: { babelPlugins?: PluginItem[] } = {}): PluginOption => {
  return [
    editor(),
    react({
      babel: {
        plugins: [...babelPlugins, reactThreeEditorBabel]
      }
    })
  ]
}
