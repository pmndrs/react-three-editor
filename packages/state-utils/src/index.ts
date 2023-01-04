export { useSelector } from "@xstate/react"
export { folder } from "leva"
export { mergeRefs } from "leva/plugin"
export type { Schema, SchemaToValues } from "leva/plugin"
export * from "xstate"
export * from "./machine/persisted"
export * from "./machine/types"
export * from "./settings"
export * from "./store"
export * from "./usePersistedControls"

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
