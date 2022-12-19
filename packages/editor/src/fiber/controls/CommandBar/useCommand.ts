import { useEffect } from "react"
import { CommandType } from "./types"
import { commandStore } from "./store"

export function useCommand(command: CommandType) {
  useEffect(() => {
    commandStore.setState((s) => {
      return {
        commands: [...s.commands, command]
      }
    })

    return () => {
      commandStore.setState((s) => {
        return {
          commands: s.commands.filter((c) => c !== command)
        }
      })
    }
  }, [command])
}
