import { FC, Fragment } from "react"
import { useEditableContext } from "./EditableElementContext"

export type HelpersProps = {}

export const Helpers: FC<HelpersProps> = () => {
  const element = useEditableContext()

  return (
    <>
      {element.editor?.plugins
        .filter((p) => p.helper && p.applicable(element))
        .map((plugin, index) => (
          <Fragment key={index}>
            <plugin.helper element={element} />
          </Fragment>
        ))}
    </>
  )
}
