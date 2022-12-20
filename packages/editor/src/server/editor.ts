import type { Plugin, ResolvedConfig, ViteDevServer } from "vite"
import { configureServer } from "./configureServer"

let justEdited: Record<string, boolean> = {}

export const editor = (): Plugin => {
  return {
    name: "vite-plugin-vinxi",
    enforce: "pre",
    handleHotUpdate(ctx) {
      if (justEdited[ctx.file]) {
        return []
      }
    },
    transformIndexHtml: async (id, prop) => {
      return [
        {
          tag: "link",
          attrs: {
            type: "text/css",
            rel: "stylesheet",
            href: "node_modules/@react-three/editor/assets/style.css"
          }
        }
      ]
    },
    configureServer
  }
}
