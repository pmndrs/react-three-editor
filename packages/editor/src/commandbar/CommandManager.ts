import { CommandStoreType, createCommandBarStore } from "./store"
import { CommandType } from "./types"

export class CommandManager {
  /*
   * central store all the commands
   */
  store: CommandStoreType = createCommandBarStore()
  useStore = this.store

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

  registerCommands(commands: CommandType[]) {
    this.store.setState((state) => {
      return {
        ...state,
        commands: [...state.commands, ...commands]
      }
    })
  }

  unregisterCommands(commands: CommandType[]) {
    this.store.setState((state) => {
      return {
        ...state,
        commands: state.commands.filter(
          (c) => !commands.some((tc) => tc.name === c.name)
        )
      }
    })
  }

  openCommandGroup(name: string) {
    this.store.setState((state) => {
      return {
        ...state,
        filter: "",
        activeCommandChain: [...state.activeCommandChain, name]
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
