import { EditPatch } from "@editable-jsx/state"
import { attributeMutations } from "./attribute-change"
import { elementMutations } from "./element"
import { importsPlugin } from "./imports"

export const plugins = (data: EditPatch<any>[]) => {
  return [importsPlugin(data), elementMutations(data), attributeMutations(data)]
}
