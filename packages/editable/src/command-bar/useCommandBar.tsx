import { useEditor } from "../useEditor"

export function useCommandBar() {
  const editor = useEditor()
  return editor.commandBar
}
