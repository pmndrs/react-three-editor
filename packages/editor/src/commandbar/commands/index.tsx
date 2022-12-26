import { Fragment } from "react"
import { EditorCommands } from "./Editor"
import { GeneralCommands } from "./General"
import { InsertElementsSubCommands } from "./InsertElement"
import { UICommands } from "./UI"

export const AllCommands = () => {
  return (
    <Fragment>
      <EditorCommands />
      <UICommands />
      <GeneralCommands />
      <InsertElementsSubCommands />
    </Fragment>
  )
}
