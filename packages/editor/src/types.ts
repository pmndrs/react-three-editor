export type JSXSource = {
  fileName: string
  lineNumber: number
  columnNumber: number
  moduleName: string
  componentName: string
  elementName: string
}

export type EditPatchActionType =
  | "insertElement"
  | "deleteElement"
  | "updateAttributes"

export type EditPatch<V = unknown> = {
  source: JSXSource
  action_type: EditPatchActionType
  value: V
}
