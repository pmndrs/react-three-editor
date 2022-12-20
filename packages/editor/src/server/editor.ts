import type { Plugin, ResolvedConfig, ViteDevServer } from "vite"
import { configureServer } from "./configureServer"

export const editor = (): Plugin => {
  const filesToSkipOnHmr: Map<string, boolean> = new Map()
  return {
    name: "vite-plugin-vinxi",
    enforce: "pre",
    handleHotUpdate(ctx) {
      if (filesToSkipOnHmr.has(ctx.file)) {
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
    configureServer: configureServer(filesToSkipOnHmr)
  }
}
