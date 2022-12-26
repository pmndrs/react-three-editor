import create from "zustand"
import { devtools } from "zustand/middleware"
import { CommandType } from "./types"

export type CommandStoreState = {
  open: boolean
  commands: Record<string, CommandType>
  activeCommandChain: string[]
  filter: string
}

export const createCommandBarStore = (name: string = "command-store") => {
  return create<CommandStoreState>(
    devtools(
      (_) => {
        return {
          open: false,
          commands: {},
          activeCommandChain: [],
          filter: ""
        }
      },
      {
        name
      }
    )
  )
}

export type CommandStoreType = ReturnType<typeof createCommandBarStore>

export const selectActiveCommands = (state: CommandStoreState) => {
  const folderChain = state.activeCommandChain
  if (folderChain.length) {
    return Object.values(state.commands).filter(
      (c) => c.parentId === folderChain[folderChain.length - 1]
    )
  } else {
    return Object.values(state.commands).filter(
      (c) => typeof c.parentId === "undefined" || c.parentId === null
    )
  }
}
