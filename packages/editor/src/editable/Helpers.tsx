import { FC, Fragment } from "react"
import { useEditableContext } from "./EditableElement"

export type HelpersProps = {}

export const Helpers: FC<HelpersProps> = () => {
  const element = useEditableContext()

  return (
    <>
      {element.editor?.plugins
        .filter((p) => p.helper && p.applicable(element))
        .map((plugin) => (
          <Fragment key={element.id}>
            <plugin.helper element={element} />
          </Fragment>
        ))}
    </>
  )
}