import create from "zustand"
import { CommandGroup, CommandType } from "./types"
import { commands } from "./commands"

export type CommandStoreState = {
  open: boolean
  commands: CommandType[]
  breadcrumb: string[]
  filter: string
  registerCommands(commands: CommandType[]): void
  toggleOpen(flag?: boolean): void
  openGroup(name: string): void
  closeGroup(name: string): void
  goBackOnGroup(): void
  setFilter(filter?: string): void
}

export const useCommandStore = create<CommandStoreState>((set, get) => ({
  open: false,
  commands: commands,
  breadcrumb: [],
  filter: "",
  setFilter(filter = "") {
    set({ filter })
  },
  toggleOpen(flag) {
    if (typeof flag !== "boolean") {
      flag = !get().open
    }
    set({ open: flag, breadcrumb: [] })
  },
  registerCommands(commands: CommandType[]) {
    set((state) => {
      return {
        ...state,
        commands: [...state.commands, ...commands]
      }
    })
  },
  openGroup(name) {
    set((state) => {
      return {
        ...state,
        filter: "",
        breadcrumb: [...state.breadcrumb, name]
      }
    })
  },
  closeGroup(name) {
    set((state) => {
      const breadcrumb = [...state.breadcrumb]
      const index = breadcrumb.indexOf(name)
      if (index > -1) {
        breadcrumb.splice(index, breadcrumb.length)
      }
      return {
        ...state,
        breadcrumb
      }
    })
  },
  goBackOnGroup() {
    set((state) => {
      const breadcrumb = [...state.breadcrumb]
      breadcrumb.pop()
      return {
        ...state,
        breadcrumb
      }
    })
  }
}))

export const selectActiveCommands = (state: CommandStoreState) => {
  const breadcrumb = state.breadcrumb
  if (breadcrumb.length) {
    const findInTree = (
      name: string,
      tree: CommandType[]
    ): CommandType | undefined => {
      return tree.find((item) => {
        if (item.name === name) return true
        if (Array.isArray((item as CommandGroup).children)) {
          return findInTree(name, (item as CommandGroup).children)
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
