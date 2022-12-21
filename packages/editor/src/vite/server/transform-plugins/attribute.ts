import { PluginObj } from "@babel/core"
import { EditPatch } from "~/types"

export const attributeMutations = (patches: EditPatch[]) => {
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
