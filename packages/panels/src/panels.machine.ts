import { DragState } from "@use-gesture/react"
import { assign, createMachine } from "xstate"

export const panelMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAcCGA7MAbWA6AlhFmAMQAiASgIIDiNAkgHI0DaADALqIoD2s+AF3w903EAA9EARgCcUgBy4AzFIBMAFlXyZ6gGwBWAOxSpAGhABPRPqVtc87bt2rb+mQ90BfT+bSYcBESklLQMzCxSXEggyHyCwqLRkghS+s64Wib6UoYGmmzq5lYIqhq4Mrn6bqlsDko23r4Y2HgQAE6oUFD46FA0ABZ8AuTUdEysnGKx-EIiYslKZWwqqtnq6obqMmyqRdJSbDL227r1RmzLbF4+Mc0B7Z3dvQNDI6HjEVG8MwnziIvqXDLNRrDZbHZ7FKrRQmQyqKTrNg2eS1Rq3fytDpdHp9QawYYhMbhVRfGJxWaJUALJYrUGbba7SyIeRSXBbGQc+S6eSGeQbeFovwtXAPbHPPEE0ZhVhKUnTeJzJKITSQkxOXBwpRyLarXLqJSCu6Yx44l74kgAZQAKgB5AAKAH1CdL2HLyb8lQgAUDaQiwQzIUpuWybAp3FUHMtDRjcAAzLA8VBCXpvIkTN0-RVU6QyIz2LQ7OHAlVMqGGOyw+HqNiGIzyUrR4XxxPJqCpl2RKburMSHMKZRqTTaPRGEyqtS6XDZNKnXQHOEGRsBZtJnHtj4kruZym9koaRQsjSLcu5Myl3J2JT1GRKPn1muom5C5cJ1cp632p1Sj6TaLyil-CUBT6LgOQ5BUKJBlqkL6pON55DWqg1goi5PkaIo8AAxgA1jiAAyYCxsMH6Os6P4ZgqO7JNsihpBo1TcnejLFNkrIyKoFT6MC2hSE4S6tFhuG9ARRHruEv7fJRgE0VOzjqAxDjqPW44IrgujVqcSJaPUuT8RhOH4YRkrvOEnZ-t2VGIDJdHyXIjFKcxzK3rJqz6Pyg5uHpECCYZolkcSFEAZ6s5TrS8lbFeOSqssqigepwK6BUBTXE0MbeQZvQUPgUD9MRtqkd+4mBR62YpDqIauIlCJyfokJOIopxaPIQYbIlXJeT5mXZblYnpluUmermhhskohijUWvK5IY0X9tymxcgo9buFIHUZVAWU5cZaafP1QWlQi7EVUiVV6PRkLuLFyxyMsGxwg48irUJ63dVtLqbuZ26AWothsvCtZclqvFItFWpsgiBxcgUiyJd4NzoDwEBwFMRq7SVu4ALS6JC6MgRyeP43jHh6YQxCoz2yQKBxA70Rc1aKY5CBuZOMXNakVQXg9aFpViTy4kMZOWQgXJqbm1b6kh6jgWexQTsNuiGOW9TyNkzWGHpK6tgLgEuLIoFsAdzgK2kNiQsrRxaNd3K5io+qPb5Aha8Fh0PrYzUbCCDMmFeoFgReo0HFUdtdZtjv7ZkyhuKoc66EivJSEo47Vso8tIXOvGSwasNAA */
  createMachine(
    {
      tsTypes: {} as import("./panels.machine.typegen").Typegen0,
      id: "panels",

      context: {
        draggingPanel: null as string | null,
        state: {} as DragState,
        panels: {} as Record<string, { position: { x: number; y: number } }>
      },

      predictableActionArguments: true,

      schema: {
        events: {} as
          | { type: "STOP_DRAGGING"; panel: string; event: DragState }
          | { type: "DRAGGING"; panel: string; event: DragState }
      },

      states: {
        idle: {
          on: {
            DRAGGING: [
              {
                cond: "isFloating",
                target: "floating",
                actions: ["startDragging"]
              },
              {
                cond: "isDockingLeft",
                target: "draggingGhost.dockingLeft",
                actions: ["startDragging"]
              },
              {
                cond: "isDockingRight",
                target: "draggingGhost.dockingRight",
                actions: ["startDragging"]
              },
              {
                cond: "isDockingCenter",
                target: "draggingGhost.floating",
                actions: ["startDragging"]
              }
            ]
          }
        },
        draggingGhost: {
          states: {
            dockingLeft: {
              on: {
                STOP_DRAGGING: {
                  target: "#panels.idle",
                  actions: ["dockToLeftPanel"]
                },
                DRAGGING: [
                  {
                    cond: "isDockingRight",
                    target: "dockingRight"
                  },
                  {
                    cond: "isDockingCenter",
                    target: "floating"
                  }
                ]
              }
            },
            floating: {
              on: {
                DRAGGING: [
                  {
                    cond: "isDockingLeft",
                    target: "dockingLeft"
                  },
                  {
                    cond: "isDockingRight",
                    target: "dockingRight"
                  }
                ],
                STOP_DRAGGING: {
                  target: "#panels.idle",
                  actions: ["undock"]
                }
              }
            },
            dockingRight: {
              on: {
                STOP_DRAGGING: {
                  target: "#panels.idle",
                  actions: ["dockToRightPanel"]
                },
                DRAGGING: [
                  {
                    cond: "isDockingLeft",
                    target: "dockingLeft"
                  },
                  {
                    cond: "isDockingCenter",
                    target: "floating"
                  }
                ]
              }
            }
          },
          initial: "floating"
        },
        floating: {
          on: {
            DRAGGING: [
              {
                cond: "isDockingLeft",
                target: "dockingLeft"
              },
              {
                cond: "isDockingRight",
                target: "dockingRight"
              }
            ],
            STOP_DRAGGING: {
              target: "idle",
              actions: ["stopDragging"]
            }
          }
        },
        dockingLeft: {
          on: {
            STOP_DRAGGING: {
              target: "idle",
              actions: ["stopDragging", "dockToLeftPanel"]
            },
            DRAGGING: [
              {
                cond: "isDockingRight",
                target: "dockingRight"
              },
              {
                cond: "isDockingCenter",
                target: "floating"
              }
            ]
          }
        },
        dockingRight: {
          on: {
            STOP_DRAGGING: {
              target: "idle",
              actions: ["stopDragging", "dockToRightPanel"]
            },
            DRAGGING: [
              {
                cond: "isDockingLeft",
                target: "dockingLeft"
              },
              {
                cond: "isDockingCenter",
                target: "floating"
              },
              {}
            ]
          }
        }
      },

      initial: "idle"
    },
    {
      actions: {
        startDragging: assign({
          draggingPanel: (_, event) => event.panel
        })
      },
      guards: {
        isDockingLeft: (context, event) => {
          return event.event.xy[0] < 100
        },
        isDockingRight: (context, event) => {
          return event.event.xy[0] > window.innerWidth - 100
        },
        isDockingCenter: (context, event) => {
          return (
            event.event.xy[0] > 210 &&
            event.event.xy[0] < window.innerWidth - 100
          )
        }
      }
    }
  )
