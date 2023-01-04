import { useHotkeys } from "react-hotkeys-hook"
import { useSettings } from "../../state-utils/dist/editable-jsx-state.cjs"

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
