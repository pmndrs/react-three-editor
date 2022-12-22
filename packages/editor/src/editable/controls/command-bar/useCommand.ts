import { useEffect } from "react"
import { CommandType } from "./types"
import { useCommandStore } from "./store"

export function useCommand(command: CommandType) {
  useEffect(() => {
    useCommandStore.setState((s) => {
      return {
        commands: [...s.commands, command]
      }
    })

    return () => {
      useCommandStore.setState((s) => {
        return {
          commands: s.commands.filter((c) => c !== command)
        }
      })
    }
  }, [command])
}
