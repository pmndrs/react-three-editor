// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {}
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    clearSelection: "CLEAR_SELECTION"
    selectElement: "SELECT"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {}
  eventsCausingServices: {}
  matchesStates:
    | "editing"
    | "editing.idle"
    | "editing.selected"
    | "editing.transforming"
    | "playing"
    | "playing.idle"
    | "playing.selected"
    | {
        editing?: "idle" | "selected" | "transforming"
        playing?: "idle" | "selected"
      }
  tags: never
}
