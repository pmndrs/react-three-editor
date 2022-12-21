import { EditPatch } from "~/types"
import { importsPlugin } from "./imports"
import { attributeMutations } from "./attribute"
import { elementMutations } from "./element"

export const plugins = (patches: EditPatch[]) => {
  return [
    importsPlugin(patches),
    elementMutations(patches),
    attributeMutations(patches)
  ]
}
