import { Editor, useEditor } from "@editable-jsx/core"
import { useEffect, useMemo } from "react"
import { CommandType } from "./types"

export function useCommands(
  _commands: CommandType[] | ((editor: Editor) => CommandType[]),
  deps: any[] = []
) {
  const editor = useEditor()
  const commands = useMemo(
    () => (typeof _commands === "function" ? _commands(editor) : _commands),
    [editor, ...deps]
  )

  useEffect(() => {
    editor.commands.registerCommands(commands)
    return () => {
      editor.commands.unregisterCommands(commands)
    }
  }, [editor, commands])
}
