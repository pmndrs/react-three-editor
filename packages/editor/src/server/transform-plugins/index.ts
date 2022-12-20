import { importsPlugin } from "./imports"
import { insertElement } from "./insertElement"
import { updateAttribute } from "./attribute-change"

export const plugins = (data: any) => {
  return [importsPlugin(data), insertElement(data), updateAttribute(data)]
}
