import create from "zustand"
import { devtools } from "zustand/middleware"
import { CommandType } from "./types"

export type CommandStoreState = {
  commands: Record<string, CommandType>
}

export const createCommandsStore = (name: string = "command-store") => {
  return create<CommandStoreState>(
    devtools(
      (_) => {
        return {
          commands: {}
        }
      },
      {
        name
      }
    )
  )
}

export type CommandStoreType = ReturnType<typeof createCommandsStore>

// export const selectActiveCommands = (state: CommandBar) => {
//   const folderChain = state.activeCommandChain
//   if (folderChain.length) {
//     return Object.values(state.commands).filter(
//       (c) => c.parentId === folderChain[folderChain.length - 1]
//     )
//   } else {
//     return Object.values(state.commands).filter(
//       (c) => typeof c.parentId === "undefined" || c.parentId === null
//     )
//   }
// }

export class CommandManager {
  has(name: string) {
    return this.store.getState().commands[name] ? true : false
  }
  /*
   * central store all the commands
   */
  store: CommandStoreType = createCommandsStore()
  useStore = this.store

  registerCommands(commands: CommandType[]) {
    if (!Array.isArray(commands)) {
      commands = [commands]
    }

    this.store.setState((state) => {
      commands.forEach((command) => {
        if (command.parentId && state.commands[command.parentId]) {
          if (!Array.isArray(state.commands[command.parentId].subcommands)) {
            state.commands[command.parentId].subcommands = []
          }
          state.commands[command.parentId].subcommands?.push(command.name)
          state.commands[command.name] = command
        } else {
          state.commands[command.name] = command
        }
      })
      return {
        ...state
      }
    })
    //
  }

  unregisterCommands(commands: CommandType[]) {
    if (!Array.isArray(commands)) {
      commands = [commands]
    }

    this.store.setState((state) => {
      commands.forEach(({ name }) => {
        delete state.commands[name]
      })
      return {
        ...state
      }
    })
    //
  }
}
