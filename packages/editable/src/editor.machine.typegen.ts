// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {}
  missingImplementations: {
    actions: "addNewElement"
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    addNewElement: "STOP_DRAGGING"
    clearSelection: "CLEAR_SELECTION"
    selectElement: "SELECT"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    isOnCanvas: "DRAGGING"
  }
  eventsCausingServices: {}
  matchesStates:
    | "editing"
    | "editing.adding"
    | "editing.draggingGhost"
    | "editing.draggingGhost.placing"
    | "editing.draggingGhost.unused"
    | "editing.idle"
    | "editing.selected"
    | "editing.transforming"
    | "playing"
    | "playing.idle"
    | "playing.selected"
    | {
        editing?:
          | "adding"
          | "draggingGhost"
          | "idle"
          | "selected"
          | "transforming"
          | { draggingGhost?: "placing" | "unused" }
        playing?: "idle" | "selected"
      }
  tags: never
}
