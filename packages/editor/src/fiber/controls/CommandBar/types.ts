import { ThreeEditor } from "../../ThreeEditor"

export type CommandType = {
  icon: (editor: ThreeEditor) => JSX.Element
  description: (editor: ThreeEditor) => string | JSX.Element
  name: string
  execute: (editor: ThreeEditor) => void
  render: (editor: ThreeEditor) => any
  shortcut?: string[]
}
