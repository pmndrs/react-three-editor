import { FC, useEffect } from "react"
import { useEditor } from "../../editable"
import { CommandType } from "../types"

export const GeneralCommands: FC = () => {
  const editor = useEditor()
  useEffect(() => {
    const commands: CommandType[] = []
    editor.commands.registerCommands(commands)
    return () => {
      editor.commands.unregisterCommands(commands)
    }
  }, [editor])
  return null
}
