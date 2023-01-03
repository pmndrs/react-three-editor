import { useHotkeys } from "react-hotkeys-hook"
import { useSettings } from "./settings"

export type { DragState } from "@use-gesture/react"
export { useSelector } from "@xstate/react"
export { button, buttonGroup, folder } from "leva"
export * from "leva/plugin"
export * from "react-hot-toast"
export { default as toast } from "react-hot-toast"
export { default as tunnel } from "tunnel-rat"
export * from "xstate"
export * from "./Floating"
export * from "./machine/persisted"
export * from "./machine/types"
export * from "./settings"
export * from "./store"
export * from "./tunnels"
export * from "./usePersistedControls"

export function useKeyboardShortcut(
  name: string,
  initialShortcut: string,
  execute: () => void
) {
  const shortcut = useSettings("shortcuts", {
    [name]: initialShortcut
  })

  useHotkeys(
    shortcut[name],
    execute,
    {
      preventDefault: true
    },
    [shortcut[name], execute]
  )
}

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
