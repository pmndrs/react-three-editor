import create from "zustand"
import { devtools } from "zustand/middleware"
import { CommandGroup, CommandType } from "./types"

export type CommandStoreState = {
  open: boolean
  commands: CommandType[]
  activeCommandChain: string[]
  filter: string
}

export const createCommandBarStore = (name: string = "command-store") => {
  return create<CommandStoreState>(
    devtools(
      (_) => {
        return {
          open: false,
          commands: [],
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
  const breadcrumb = state.activeCommandChain
  if (breadcrumb.length) {
    const findInTree = (
      name: string,
      tree: CommandType[]
    ): CommandType | undefined => {
      return tree.find((item) => {
        if (item.name === name) return true
        if (Array.isArray((item as CommandGroup).children)) {
          return findInTree(name, item.children ?? [])
        }
      })
    }
    const currentFolder = breadcrumb[breadcrumb.length - 1]
    const group = findInTree(currentFolder, state.commands)
    return Array.isArray((group as CommandGroup).children)
      ? (group as CommandGroup).children
      : []
  }

  return state.commands
}
