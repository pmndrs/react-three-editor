import toast from "react-hot-toast"
import { useHotkeys } from "react-hotkeys-hook"
import { useEditor } from "../editable"
import { isCommand } from "./utils"

export function KeyboardCommands() {
  const editor = useEditor()
  const commands = editor.commands.store((state) =>
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
              shortcut={command.shortcut}
              execute={() => command.execute(editor)}
              debug={true}
            />
          )
        })}
    </>
  )
}

export function KeyboardShortcut({
  shortcut,
  execute,
  debug = false
}: {
  shortcut: string[]
  execute: () => void
  debug?: boolean
}) {
  useHotkeys(
    shortcut.join("+"),
    () => {
      if (debug)
        toast.custom(
          <div className="kbd-shortcut">
            {shortcut?.map((key, i) => (
              <kbd
                key={`${i}`}
                style={{
                  marginLeft: i > 0 ? "4px" : "0px"
                }}
              >
                {key === "meta"
                  ? "⌘"
                  : key === "shift"
                  ? "⇧"
                  : key.toUpperCase()}
              </kbd>
            ))}
          </div>
        )
      execute()
    },
    [shortcut.join("+"), execute, debug],
    {
      preventDefault: true
    }
  )

  return null
}
