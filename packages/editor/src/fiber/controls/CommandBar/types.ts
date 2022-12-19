import { ThreeEditor } from "../../ThreeEditor"

export type CommonProperties = {
  name: string
  icon?: string | ((editor: ThreeEditor) => JSX.Element)
  description?: string | ((editor: ThreeEditor) => string | JSX.Element)
  render?: (editor: ThreeEditor) => any
}

export type CommandGroup = CommonProperties & {
  children: CommandType[]
}

export type ExecutableCommand = CommonProperties & {
  shortcut?: string[]
  execute: (editor: ThreeEditor) => void
}

export type CommandType = ExecutableCommand | CommandGroup
