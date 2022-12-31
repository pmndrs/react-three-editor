// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {}
  missingImplementations: {
    actions: "dockToLeftPanel" | "dockToRightPanel" | "stopDragging" | "undock"
    delays: never
    guards: "isFloating"
    services: never
  }
  eventsCausingActions: {
    dockToLeftPanel: "STOP_DRAGGING"
    dockToRightPanel: "STOP_DRAGGING"
    startDragging: "DRAGGING"
    stopDragging: "STOP_DRAGGING"
    undock: "STOP_DRAGGING"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {
    isDockingCenter: "DRAGGING"
    isDockingLeft: "DRAGGING"
    isDockingRight: "DRAGGING"
    isFloating: "DRAGGING"
  }
  eventsCausingServices: {}
  matchesStates:
    | "dockingLeft"
    | "dockingRight"
    | "draggingGhost"
    | "draggingGhost.dockingLeft"
    | "draggingGhost.dockingRight"
    | "draggingGhost.floating"
    | "floating"
    | "idle"
    | { draggingGhost?: "dockingLeft" | "dockingRight" | "floating" }
  tags: never
}
