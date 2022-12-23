import { Editor } from "../editable"

export type CommonProperties = {
  name: string
  icon?: string | ((editor: Editor) => JSX.Element)
  description?: string | ((editor: Editor) => string | JSX.Element)
  render?: (editor: Editor) => any
}

export interface CommandGroup extends CommonProperties {
  children?: CommandType[]
}

export interface ExecutableCommand extends CommonProperties {
  shortcut?: string[]
  execute?: (editor: Editor) => void
}

export interface CommandType extends ExecutableCommand, CommandGroup {}
