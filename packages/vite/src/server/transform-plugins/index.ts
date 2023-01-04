import { importsPlugin } from "./imports"
import { elementMutations } from "./element"
import { attributeMutations } from "./attribute-change"
import { EditPatch } from "../../../types"

export const plugins = (data: EditPatch<any>[]) => {
  return [importsPlugin(data), elementMutations(data), attributeMutations(data)]
}
