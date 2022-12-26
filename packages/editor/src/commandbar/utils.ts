import { CommandType } from "./types"

export const isCommandGroup = (command: CommandType) => {
  return !command.execute
}

export const isCommand = (command: CommandType) => {
  return typeof command.execute === "function"
}
