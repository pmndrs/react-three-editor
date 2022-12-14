import { useKeyboardShortcut } from "@editable-jsx/ui"
import { useCommandManager } from "./CommandManager"
import { isCommand } from "./utils"

export function KeyboardCommands() {
  const commandManager = useCommandManager()
  const commands = commandManager.useStore((state) =>
    Object.values(state.commands)
  )

  return (
    <>
      {commands
        .filter((c) => isCommand(c))
        .map((command: any) => {
          if (!command.shortcut) return null
          return (
            <KeyboardShortcut
              key={command.name}
              name={command.name}
              shortcut={command.shortcut}
              execute={() => command.execute(commandManager.context)}
              debug={true}
            />
          )
        })}
    </>
  )
}

export function KeyboardShortcut({
  name,
  shortcut,
  execute,
  debug = false
}: {
  name: string
  shortcut: string[]
  execute: () => void
  debug?: boolean
}) {
  useKeyboardShortcut(name, shortcut.join("+"), execute)

  // useHotkeys(
  //   shortcut.join("+"),
  //   () => {
  //     if (debug)
  //       toast.custom(
  //         <div className="kbd-shortcut">
  //           {shortcut?.map((key, i) => (
  //             <kbd
  //               key={`${i}`}
  //               style={{
  //                 marginLeft: i > 0 ? "4px" : "0px"
  //               }}
  //             >
  //               {key === "meta"
  //                 ? "⌘"
  //                 : key === "shift"
  //                 ? "⇧"
  //                 : key.toUpperCase()}
  //             </kbd>
  //           ))}
  //         </div>
  //       )
  //     execute()
  //   },
  //   [shortcut.join("+"), execute, debug],
  //   {
  //     preventDefault: true
  //   }
  // )

  return null
}
