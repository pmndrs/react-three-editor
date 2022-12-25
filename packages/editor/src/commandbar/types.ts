import { Editor } from "../editable"

export type CommandType = {
  type: "seperator" | "command" | "group"
  name: string
  icon?: string | ((editor: Editor) => JSX.Element)
  description?: string | ((editor: Editor) => string | JSX.Element)
  render?: (editor: Editor) => any
  parentId?: string | null
  shortcut?: string[]
  execute?(editor: Editor): void
  subcommands?: string[]
}
