import { FC, PropsWithChildren } from "react"

import { EditableContext } from "./EditableContext"
import { Helpers } from "./Helpers"
import { useEditor } from "./useEditor"

export type EditableElementProps = PropsWithChildren<{
  component: any
  props: any
  forwardRef?: any
  children?: any
  root?: boolean
}>

export const EditableComponent: FC<EditableElementProps> = ({
  component,
  props,
  forwardRef
}: EditableElementProps) => {
  const editor = useEditor()
  const [editableElement, editableProps] = editor.useElement(
    component,
    props,
    forwardRef
  )

  if (editableElement.forwardedRef) {
    return (
      <EditableContext.Provider value={editableElement}>
        <editableElement.type {...editableProps} />
        {editableElement.mounted && <Helpers />}
      </EditableContext.Provider>
    )
  } else {
    return (
      <EditableContext.Provider value={editableElement}>
        <editableElement.type {...editableProps} />
        <Helpers />
      </EditableContext.Provider>
    )
  }
}
