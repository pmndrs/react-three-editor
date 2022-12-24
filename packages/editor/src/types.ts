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
  | "updateAttribute"

export type EditPatch<V = unknown> = {
  source: JSXSource
  action_type: EditPatchActionType
  value: V
}

export type RpcServerFunctions = {
  save(patches: EditPatch | EditPatch[]): Promise<void>
  initializeComponentsWatcher(): Promise<void>
}

export type RpcClientFunctions = {}
