import { EditorCommands } from "./Editor"
import { InsertElementsSubCommands } from "./InsertElement"
import { UICommands } from "./UI"

export const AllCommands = () => {
  return (
    <>
      <EditorCommands />
      <UICommands />
      <InsertElementsSubCommands />
    </>
  )
}
