import { Fragment } from "react"
import { EditorCommands } from "./Editor"
import { InsertElementsSubCommands } from "./InsertElement"
import { UICommands } from "./UI"

export const AllCommands = () => {
  return (
    <Fragment>
      <EditorCommands />
      <UICommands />
      <InsertElementsSubCommands />
    </Fragment>
  )
}
