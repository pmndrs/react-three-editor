import toast from "react-hot-toast"
import { useHotkeys } from "react-hotkeys-hook"
import { useEditor } from "../../useEditor"
import { useCommandStore } from "./store"

export function KeyboardCommands() {
  const commands = useCommandStore((state) => state.commands)
  const editor = useEditor()

  const [{ shortcuts: debug }] = editor.useSettings("debug", {
    shortcuts: false
  })

  return (
    <>
      {commands.map((command) => {
        if (!command.shortcut) return null

        return (
          <KeyboardShortcut
            key={command.name}
            debug={debug as boolean}
            shortcut={command.shortcut}
            execute={() => command.execute(editor)}
          />
        )
      })}
    </>
  )
}

export function KeyboardShortcut({
  shortcut,
  execute,
  debug
}: {
  shortcut: string[]
  execute: () => void
  debug: boolean
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
