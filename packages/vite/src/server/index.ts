import { Plugin } from "vite"
import { ServerOptions } from "../types"
import { configureServer } from "./configureServer"
import { filesToSkipOnHmr } from "./filesToSkipOnHmr"

export const editor = (options: ServerOptions = {}): Plugin => {
  return {
    name: "vite-plugin-react-three-editor",
    enforce: "pre",
    handleHotUpdate(ctx) {
      if (filesToSkipOnHmr.get(ctx.file)?.skip === true) {
        filesToSkipOnHmr.get(ctx.file)!.skip = false
        filesToSkipOnHmr.get(ctx.file)!.timeout = 0
        console.log("silently updated", ctx.file)

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
            href: "/node_modules/@react-three/editor/assets/style.css"
          }
        }
      ]
    },
    configureServer: configureServer(options)
  }
}
