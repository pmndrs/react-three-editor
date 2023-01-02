import { FC, Fragment } from "react"
import { useEditableContext } from "./EditableContext"
import { useEditor } from "./useEditor"

export type HelpersProps = {}

export const Helpers: FC<HelpersProps> = () => {
  const editor = useEditor()
  const element = useEditableContext()

  return (
    <>
      {editor.plugins
        .filter((p) => p.helper && p.applicable(element))
        .map((plugin, index) => (
          <Fragment key={index}>
            <plugin.helper element={element} />
          </Fragment>
        ))}
    </>
  )
}
