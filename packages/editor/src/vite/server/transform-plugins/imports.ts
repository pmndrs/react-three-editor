import { PluginObj } from "@babel/core"
import { EditPatch } from "~/types"

export const importsPlugin = (patches: EditPatch[]) => {
  return (): PluginObj => {
    return {
      visitor: {
        Program() {
          //
        }
      }
    }
  }
}
