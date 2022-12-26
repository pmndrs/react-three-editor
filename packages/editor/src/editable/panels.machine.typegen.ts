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
    setDragPosition: "DRAGGING"
    startDragging: "START_DRAGGING"
    stopDragging: "STOP_DRAGGING"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {}
  eventsCausingServices: {}
  matchesStates: "dragging" | "idle"
  tags: never
}
