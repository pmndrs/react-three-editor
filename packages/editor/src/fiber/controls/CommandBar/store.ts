import create from "zustand"
import { CommandType } from "./types"

export const commandStore = create((get, set) => ({
  open: false,
  commands: [] as CommandType[]
}))
