import { importsPlugin } from "./imports"
import { elementMutations } from "./element"
import { attributeMutations } from "./attribute-change"

export const plugins = (data: any) => {
  return [importsPlugin(data), elementMutations(data), attributeMutations(data)]
}
