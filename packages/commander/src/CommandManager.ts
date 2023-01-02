import { createStore, Store } from "@editable-jsx/controls"
import { createContext, useContext } from "react"

export type CommandType<T = any> = {
  type: "seperator" | "command" | "group"
  name: string
  icon?: string | ((editor: T) => JSX.Element)
  description?: string | ((editor: T) => string | JSX.Element)
  render?: (editor: T) => any
  parentId?: string | null
  shortcut?: string[]
  execute?(editor: T): void
  subcommands?: string[]
}

export type CommandStoreState = {
  commands: Record<string, CommandType>
}

export class CommandManager<T = any> {
  constructor(public context = {} as T) {}

  has(name: string) {
    return this.store.getState().commands[name] ? true : false
  }
  /*
   * central store all the commands
   */
  store: Store<{
    commands: Record<string, CommandType<T>>
  }> = createStore("commands", (set, get) => ({
    commands: {}
  }))

  useStore = this.store

  registerCommands(commands: CommandType<T>[]) {
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

  unregisterCommands(commands: CommandType<T>[]) {
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

export const CommandManagerContext = createContext({} as CommandManager)

export function useCommandManager<T>(): CommandManager<T> {
  return useContext(CommandManagerContext)
}
