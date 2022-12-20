import { importsPlugin } from "./imports"
import { insertElement } from "./insertElement"

export const plugins = (data: any) => {
  return [importsPlugin(data), insertElement(data)]
}
