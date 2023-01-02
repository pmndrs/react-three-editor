import { assign, createMachine } from "xstate"

export const editorMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5SQJYBcD2AnAdKtKAdlDihADZgDEAKgPIDiDAMgKID6AsnQCKsDaABgC6iUAAcMsdCgyExIAB6IAjIICsAZhwB2AJwA2ABzqDKo2aMqdAGhABPROpXaALHo8GATDoM71Aa4AvkF2+Nh4EDLEpBTUAMo0AIIASjTsAArMSQCaAJIAcgxCokggktIEcgrKCGpauoYmlpbWdo4Iel4GONaGXpr+6h46XiFhUZi4+EQkZJRU8axsAMI0JQoVMtVltQMqOIJHR+pGejouRq7tiP56OOcGrv7G5vqa4+CTETMx8wnJNLsJI8HiFYoiTZSbbyXaILyuA7HE5nC6aK43OpeQT3AyabqjLw+IxGQQ6T7haaTWY4ACGECixEW9AywNB4I2ZS2VVhoD2agexjurlJ3R86kxgwO-iOPlcggMggGBgMFO+VOiJFgYEoAGM0JBaIwWBxuHxORJoTyaqoNNp9MZTOZWrYHIgzOocOpBJpBO4jJoAjp-Gr0D9qTFtXqDRBmal0llchzIVyrbJeUpbQ0Hc1neY2m6EAY9EZeqZuiXvF51OTQl8wxqCJGdWB9YbEvH2DQUkkCvEAGJ0FKcZOlS2VdM2osqT16BVeLrWaykzSY-Q6XRaH3dZxEqyhqaRTU4KOtmNUJIZDKsAo8djLVicG-rFPjmFTnT4xoqPw6KznZxXQ6T9BBwbFfSMXwfUGA9w2PU821jFY2FSdgllWGg8joAoLXKNMdj5eEvCRZFTnOS5rkLFVXEOAZA2LY5nVgxsaQQ890NYNZcO5Sc4QQfwvF6FRsT3TRBmcVcqM0GiEU8EliO9PRgjrSkjybEgICwWkoCgWYGAACykNAcAAV0IEztVjHgeyYUcoQnAjMwQJ1enlRVIIXREA0xYScRwPECSJYlSVrCYGzUmlNO03TiAMoycHEchaV1WZmToVlrKSWyim4-CM1qFcy28eUFUEGdpJ8lQfxwVwF3UVxNFePRpI+FT1QimI0C0whYAAM2wABbVKOyBRN8hy188Ic-Ks3tJonQsfMgNuExN19LxFvUatIOYjqSC62kev6rAhqZegmDYLheAESaeMc2p6jmx0WiWzEAx6atfXlUZNB-FVdt+fbur6wbhpZLsez7Qdhzs1NpqnD0HnnRcLj-H012eMCt2xeqxJE3bEtpewaX+OMgVYMFMImscpvfPjvB836Hg8Dxau6DRPwJpLib+OIjQu01rty+G+NGHyjEE71jjxMTDG9IwuaJkm+Y4rjbryqcXEMMCWv0M4BlcYtMS20C9C3CxXERLoFba8LCZ5rUW0Qsn0gpvIqYhGm7pm5yvEZ7WXGrYr9CqmtFYdk8nfPc6TSu811ZFwjfbeg53A8CWqqsdwAnD1io-bB81a9jW+J-DRDhnZwAnZ+TjbOMCfUEFdIPORFc+baNDWQ1hUNVzDsOFumk61j7dZLLppKNwtapolnDF8RUFR0ZS60IDAIDgBRKXsoenMojoAFpVVtw9AZ360+OGTENpkqXhPREO51C+tT4jOY4nP3jh6JSrtcN4YyTdAsFYG2YVX7HnpIyKAn97q2mWggQYglqyymXqVZUx8wFwXUpHTuEAYE+1cMML0OhoLDDNpbS2EpCx-k9CQ9ac5zAmDDifLBkUtI6T0oZWAaB8FTnlJ6Gc3h6o1nlFcSSHQ1AbQeHVJShtBjKUwSxGIUUOGxS4cZMyFlIC8L4oQ7QgjqyENQWInyxFQKBz8EFP8IUAZvxwComKUA4rcISklFKxAdFJyuIJZ4BhTB0N8c4Ux1gcDom6MVPE+h1C2OPAdI6oMPFw13gVequgWrnAsGSZea4uj+WLMWUYLMVDt2gUki+39ND3ANvKZqiIrbwLEhuKWZUrheUKSU2IlBPFOWEpBHWlscTSRUPU42TNvDnA2n6FU+4WG4HtnnXB3SHpCJqmIp4jw-HiPdHOIqFYLBEmYSEIAA */
  createMachine(
    {
      tsTypes: {} as import("./editor.machine.typegen").Typegen0,
      id: "editor",
      initial: "editing",
      context: {
        selectedId: null as string | null,
        addingElement: null as { type: string; id: string } | null,
        ghostPosition: [0, 0, 0] as [number, number, number]
      },
      predictableActionArguments: true,

      schema: {
        events: {} as
          | { type: "TOGGLE_MODE" }
          | { type: "START_PLAYING" }
          | { type: "START_ADDING" }
          | { type: "DRAGGING" }
          | { type: "STOP_DRAGGING"; componentType: string; id: string }
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
                  target: "draggingGhost.unused"
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
            draggingGhost: {
              initial: "unused",
              states: {
                unused: {
                  on: {
                    DRAGGING: {
                      cond: "isOnCanvas",
                      target: "placing"
                    }
                  }
                },
                placing: {
                  on: {
                    DRAGGING: {
                      target: "placing"
                    },
                    STOP_DRAGGING: {
                      target: "#editor.editing.idle",
                      actions: ["addNewElement"]
                    }
                  }
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
          selectedId: () => null as string | null,
          addingElement: () => null as { type: string; id: string } | null,
          ghostPosition: () => [0, 0, 0] as [number, number, number]
        })

        // addNewElement: assign({
        //   addingElement: (_, ({ componentType, id })) => ({ type: componentType, id }) as { type: string; id: string } | null
        // })
      },
      guards: {
        isOnCanvas: () => true
      }
    }
  )
