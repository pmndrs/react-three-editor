import { FC, PropsWithChildren, ReactNode } from "react"
import { EditableElement } from "./EditableElement"

import { EditableElementContext } from "./EditableElementContext"
import { Helpers } from "./Helpers"

export type EditableElementProviderProps = PropsWithChildren<{
  editableElement: EditableElement
}>

export const EditableElementProvider: FC<EditableElementProviderProps> = ({
  editableElement,
  children
}) => {
  if (editableElement.forwardedRef) {
    return (
      <EditableElementContext.Provider value={editableElement}>
        {children}
        {editableElement.mounted && <Helpers />}
      </EditableElementContext.Provider>
    )
  } else {
    return (
      <EditableElementContext.Provider value={editableElement}>
        {children}
        <Helpers />
      </EditableElementContext.Provider>
    )
  }
}
