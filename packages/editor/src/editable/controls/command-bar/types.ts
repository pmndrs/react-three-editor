import { Editor } from "../../Editor"

export type CommonProperties = {
  name: string
  icon?: string | ((editor: Editor) => JSX.Element)
  description?: string | ((editor: Editor) => string | JSX.Element)
  render?: (editor: Editor) => any
}

export type CommandGroup = CommonProperties & {
  children: CommandType[]
}

export type ExecutableCommand = CommonProperties & {
  shortcut?: string[]
  execute: (editor: Editor) => void
}

export type CommandType = ExecutableCommand | CommandGroup
