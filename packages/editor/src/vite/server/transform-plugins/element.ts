import { PluginObj } from "@babel/core"
import { EditPatch } from "~/types"

export const elementMutations = (patches: EditPatch[]) => {
  return (): PluginObj => {
    return {
      visitor: {
        JSXElement() {
          //
        }
      }
    }
  }
}
