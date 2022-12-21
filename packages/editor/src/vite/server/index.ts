import { Plugin } from "vite"
import { createConfigureServerMethod } from "./configureServer"
import { ReactThreeViteServerOptions } from "./types"

export const editor = (): Plugin => {
  const options: ReactThreeViteServerOptions = {}
  return {
    name: "vite-plugin-react-three-editor",
    enforce: "pre",
    transformIndexHtml: async (id, prop) => {
      return [
        {
          tag: "link",
          attrs: {
            type: "text/css",
            rel: "stylesheet",
            href: "node_modules/@react-three/editor/assets/commandbar-styles.css"
          }
        }
      ]
    },
    configureServer: createConfigureServerMethod(options)
  }
}

export default editor
