import { Plugin } from "vite"
import { createConfigureServerMethod } from "./configureServer"
import { ReactThreeViteServerOptions } from "./types"

export const editor = (): Plugin => {
  const options: ReactThreeViteServerOptions = {}
  return {
    name: "vite-plugin-react-three-editor",
    enforce: "pre",
    configureServer: createConfigureServerMethod(options)
  }
}

export default editor
