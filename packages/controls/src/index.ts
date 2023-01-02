export type { DragState } from "@use-gesture/react"
export * from "@xstate/react"
export * from "leva/plugin"
export { default as tunnel } from "tunnel-rat"
export * from "xstate"
export * from "./Floating"
export * from "./machine/persisted"
export * from "./machine/types"
export * from "./settings"
export * from "./store"
export * from "./tunnels"
export * from "./usePersistedControls"
export * from "./useSettings"

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
