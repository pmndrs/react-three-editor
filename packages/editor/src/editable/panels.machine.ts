import { assign, createMachine } from "xstate"

export const panelMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QAcCGA7MAbWA6AlhFmAMQDKAKgIIBKFA+gCI1UDirAkgHKsDaADAF1EKAPax8AF3yj0IkAA9EATgCsuABwAmACy7lWgGwB2VcY0BGLQBoQAT0QBaLev3LDyndr0WNpgL7+tmiYOLgQAE6oUFD46FDkFADyAApMLOzcfELyyOJSMnJIik5aRrjGZYYuxgDMulq+GrYOCM6uOsrunt6NfqqBQSDoohBwuRjY8MV5EtKy8kptWsY6FVU19T7KLU4Wysa41Rr9dQ1NgcGTYYTEufnzRaBLjjq1uKrVOh5e5-27bQsQNwVhOpjOPhOlxAISm4SiMTiUHuc0KiyctUMRw0tU+9S2fVMAJOIJxXyM4MsWkG-iAA */
  createMachine(
    {
      tsTypes: {} as import("./panels.machine.typegen").Typegen0,
      id: "panels",

      context: {
        draggingPanel: null as string | null,
        dragPosition: { x: 0, y: 0 } as { x: number; y: number }
      },

      predictableActionArguments: true,

      schema: {
        events: {} as
          | { type: "START_DRAGGING"; panelId: string }
          | { type: "STOP_DRAGGING" }
          | { type: "DRAGGING"; e: { x: number; y: number } }
      },

      states: {
        idle: {
          on: {
            START_DRAGGING: {
              target: "dragging",
              actions: ["startDragging"]
            }
          }
        },

        dragging: {
          on: {
            DRAGGING: {
              actions: ["setDragPosition"]
            },
            STOP_DRAGGING: {
              target: "idle",
              actions: ["stopDragging"]
            }
          }
        }
      },

      initial: "idle"
    },
    {
      actions: {
        startDragging: assign({
          draggingPanel: (_, event) => event.panelId
        }),
        setDragPosition: assign({
          dragPosition: (_, event) => event.e
        }),
        stopDragging: assign({
          dragPosition: () => ({ x: 0, y: 0 }),
          draggingPanel: () => null
        })
      }
    }
  )
