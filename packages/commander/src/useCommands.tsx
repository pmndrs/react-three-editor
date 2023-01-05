import { useEffect, useMemo } from "react"
import { CommandType, useCommandManager } from "./CommandManager"

export function useCommands<T = any>(
  _commands: CommandType<T>[] | ((ctx: T) => CommandType<T>[]),
  deps: any[] = []
) {
  const commandManager = useCommandManager<T>()
  const commands = useMemo(
    () =>
      typeof _commands === "function"
        ? _commands(commandManager.context)
        : _commands,
    [commandManager, ...deps]
  )

  useEffect(() => {
    commandManager.registerCommands(commands)
    return () => {
      commandManager.unregisterCommands(commands)
    }
  }, [commandManager, commands])
}
