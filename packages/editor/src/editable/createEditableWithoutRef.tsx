import { FC, PropsWithChildren } from "react"
import { EditableElementContext } from "./contexts"
import { PropsWithSource } from "./types"
import { useCreateEditableElement } from "./useCreateEditableElement"

export const createEditableWithoutRef = <P, R>(Component: any) => {
  const Editable: FC<PropsWithSource<PropsWithChildren<P>>> = (props) => {
    const { children, ...rest } = props
    const editableElement = useCreateEditableElement(
      Component,
      props.__source,
      props
    )
    return (
      <EditableElementContext.Provider value={editableElement}>
        <Component {...rest} {...editableElement.props}>
          {children}
        </Component>
      </EditableElementContext.Provider>
    )
  }
  return Editable
}
