import { useSettings } from "@editable-jsx/state"
import { useHotkeys } from "react-hotkeys-hook"

export function useKeyboardShortcut(
  name: string,
  initialShortcut: string,
  execute: () => void
) {
  const shortcut = useSettings("shortcuts", {
    [name]: initialShortcut
  })

  useHotkeys(
    shortcut[name],
    execute,
    {
      preventDefault: true
    },
    [shortcut[name], execute]
  )
}
