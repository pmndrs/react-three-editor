import { assign, createMachine } from "xstate"

export const editorMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5SQJYBcD2AnAdKtKAdlDihADZgDEAKgPIDiDAMgKID6AsnQCKsDaABgC6iUAAcMsdCgyExIAB6IAjIIAsAJhwBWAGyadm9SoCcJ0wGZTAGhABPRJoO7BbrZoDsOy95V6AXwC7fGw8CBliUgpqAGUaAEEAJRp2AAVmBIBNAEkAOQYhUSQQSWkCOQVlBDUtXQMjCwtrO0cESxVLHDc3SxNfHtNPIJCIzFx8IhIySipY1jYAYRoihTKZSpLqzUEdHFMDg88zawAOTUsdVsQdHVMcdU89HRVbr1P1W5HwMbDJqNgYEoAGM0JBaIwWBxuHxViV1hV5FtVBptPpDMYzM1bA5EL49jpBJYiS89KYNOZ1N9QhMxlMcICQWCIHNEil0plcgU4RIpBskaBqrU0Q1MeYTji2lo9N0iWodqdTHo+sZqb9aZESIywKDwfFkqkaEkEnlYgAxOhJTj5QoiNZ8xFVRAGQT7QTKwSaFQfdSnTyWa4IO6eHCGYmK07nQSeTSnNXoP50gFAnXMqgJNJpVh5HjsBasTjZlZ2+EO2QCpSIdQaHCeU4qWMaauCNSnK64oOae6eOXuPRmO6WePjcKahkp3UsxZsZLseZLGg5Oh5HmlMubQVOXb7Q5DCXnS6B9TK3QXAbRx4mFTDxNj7WTub55arhHlp0IdSfbpt0yK0wNttjCPSwum8Xo3D0OtOjjYIfgTDUCCiNAsAAQ0IWAADNsAAWymVkDQ5bIbRfdcKyFVF6gxJoJUDHRHl0U49HUDpLl8U4iRvBD6WQtDMJwvD6CYNguF4AQS15co32RGoKPRRosRojs7lOb8mIuL06Pda9YJpUdEJIHj0KwrBcOIR8FxIySN0rBB-XuL0-U8T9xWVdRaOPWsfEEX9PSbYYdPVHBxHIFD7HpGY4jZVJWB4HJF25cS1yssibk0QN61cHoLhjcw6x0TigpCsKogiiEhOhUTLP5d8DEDTptB6OUnmrHwGyCWDCAwCA4AUGl7WS98VEDABaPZd3G3dPFMAr-igfrquk9RJTxDzDDcLwyV9Z4rBmpNphiebHWkoZaJ7HBXmJXLnm8-1drvCdmUOqTNw-T9dB7ViDEVHtTlottQyJbz1MuNs7v0nBDL4kypie6zqh-Ws+hMX1NGMSxlVo0xtH8IYdCm3ZOiMArgtCmHSwG6SG1jWU3CMEG0fbNoOldbxLv0S8Dk0YmivCg7yYWl6GyeGndguHRzmYxm8V-UMvJ8nZPx7QJ2qAA */
  createMachine(
    {
      tsTypes: {} as import("./editor.machine.typegen").Typegen0,
      id: "editor",
      initial: "editing",
      context: {
        selectedId: null as string | null
      },
      predictableActionArguments: true,

      schema: {
        events: {} as
          | { type: "TOGGLE_MODE" }
          | { type: "START_PLAYING" }
          | { type: "START_ADDING" }
          | { type: "STOP_ADDING" }
          | { type: "START_EDITING" }
          | { type: "SELECT"; elementId: string }
          | { type: "CLEAR_SELECTION" }
          | { type: "START_TRANSFORMING" }
          | { type: "STOP_TRANSFORMING" }
          | { type: "APPEND_ELEMENT"; elementId: string; parentId: string }
      },
      states: {
        editing: {
          initial: "idle",
          states: {
            idle: {
              on: {
                TOGGLE_MODE: "#editor.playing",
                START_PLAYING: "#editor.playing",
                SELECT: {
                  target: "selected",
                  actions: ["selectElement"]
                },
                START_ADDING: {
                  target: "adding"
                }
              }
            },
            adding: {
              on: {
                STOP_ADDING: "idle"
              }
            },
            selected: {
              on: {
                TOGGLE_MODE: "#editor.playing.selected",
                START_PLAYING: "#editor.playing.selected",
                START_TRANSFORMING: "transforming",
                APPEND_ELEMENT: {
                  actions: []
                },
                CLEAR_SELECTION: {
                  target: "idle",
                  actions: ["clearSelection"]
                },
                SELECT: {
                  target: "selected",
                  actions: ["selectElement"]
                }
              }
            },
            transforming: {
              on: {
                START_PLAYING: "#editor.playing",
                TOGGLE_MODE: "#editor.playing",
                STOP_TRANSFORMING: "selected"
              }
            }
          }
        },
        playing: {
          initial: "idle",
          states: {
            idle: {
              on: {
                START_EDITING: "#editor.editing",
                TOGGLE_MODE: "#editor.editing",
                SELECT: {
                  target: "selected",
                  actions: ["selectElement"]
                }
              }
            },
            selected: {
              on: {
                START_EDITING: "#editor.editing",
                TOGGLE_MODE: "#editor.editing",
                SELECT: {
                  target: "selected",
                  actions: ["selectElement"]
                },
                CLEAR_SELECTION: {
                  target: "idle",
                  actions: ["clearSelection"]
                }
              }
            }
          }
        }
      }
    },
    {
      actions: {
        selectElement: assign({
          selectedId: (_, event) => event.elementId
        }),
        clearSelection: assign({
          selectedId: () => null as string | null
        })
      }
    }
  )
