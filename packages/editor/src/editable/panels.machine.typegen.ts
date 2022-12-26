// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {}
  missingImplementations: {
    actions:
      | "dockToLeftPanel"
      | "dockToRightPanel"
      | "float"
      | "setDragPosition"
      | "stopDragging"
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    dockToLeftPanel: "STOP_DRAGGING"
    dockToRightPanel: "STOP_DRAGGING"
    float: "STOP_DRAGGING"
    setDragPosition: "DRAGGING"
    startDragging: "DRAGGING"
    stopDragging: "STOP_DRAGGING"
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
    | "floating"
    | "idle"
  tags: never
}
