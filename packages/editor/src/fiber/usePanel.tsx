import { StoreType } from "leva/dist/declarations/src/types"
import { useEditor } from "../editable/Editor"

export function usePanel(defaultName: StoreType | string) {
  const editor = useEditor()
  return editor.getPanel(defaultName)
}
