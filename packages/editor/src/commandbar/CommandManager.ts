import { CommandStoreType, createCommandBarStore } from "./store"
import { CommandType } from "./types"

export class CommandManager {
  /*
   * central store all the commands
   */
  store: CommandStoreType = createCommandBarStore()

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

  toggleCommandBar(flag?: boolean) {
    this.store.setState((state) => {
      if (typeof flag !== "boolean") {
        flag = !state.open
      }
      return {
        ...state,
        filter: !flag ? "" : state.filter,
        activeCommandChain: !flag ? [] : state.activeCommandChain,
        open: flag
      }
    })
  }

  openCommandGroup(name: string) {
    this.store.setState((state) => {
      let activeCommandChain = [...state.activeCommandChain]
      if (state.commands[name]) {
        activeCommandChain.push(name)
      }
      return {
        ...state,
        filter: "",
        activeCommandChain
      }
    })
  }

  closeCommandGroup(name?: string) {
    this.store.setState((state) => {
      let activeCommandChain = [...state.activeCommandChain]
      if (name) {
        const index = activeCommandChain.indexOf(name)
        if (index > -1) {
          activeCommandChain = activeCommandChain.splice(
            index,
            activeCommandChain.length
          )
        }
      } else {
        activeCommandChain.pop()
      }

      return {
        ...state,
        filter: "",
        activeCommandChain
      }
    })
  }
}
