import { FC, useEffect } from "react"
import { useEditor } from "../../editable"
import { CommandType } from "../types"

export const GeneralCommands: FC = () => {
  const editor = useEditor()
  useEffect(() => {
    const commands: CommandType[] = []
    editor.registerCommands(commands)
    return () => {
      editor.unregisterCommands(commands)
    }
  }, [editor])
  return null
}
