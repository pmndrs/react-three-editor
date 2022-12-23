import { FC, useEffect } from "react"
import { useEditor } from "../../editable"
import { CommandType } from "../types"

export const UICommands: FC = () => {
  const editor = useEditor()
  useEffect(() => {
    const commands: CommandType[] = [
      {
        name: "show-panels"
      },
      {
        name: "hide-panels"
      }
    ]
    editor.registerCommands(commands)
    return () => {
      editor.unregisterCommands(commands)
    }
  }, [editor])
  return null
}
