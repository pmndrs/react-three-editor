import type { Plugin } from "vite"
import { configureServer } from "./configureServer"
import { filesToSkipOnHmr } from "./filesToSkipOnHmr"

export const editor = (): Plugin => {
  return {
    name: "vite-plugin-vinxi",
    enforce: "pre",
    handleHotUpdate(ctx) {
      if (filesToSkipOnHmr.has(ctx.file) && filesToSkipOnHmr.get(ctx.file)) {
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
