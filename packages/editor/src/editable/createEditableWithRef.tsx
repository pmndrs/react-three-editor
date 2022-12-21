import { forwardRef, PropsWithChildren } from "react"
import { EditableElementContext } from "./contexts"
import { PropsWithSource } from "./types"
import { useCreateEditableElement } from "./useCreateEditableElement"
import { composeRefs } from "./utils"

export const createEditableWithRef = <R, P>(Component: any) => {
  return forwardRef<R, PropsWithSource<PropsWithChildren<P>>>(
    (props, forwardedRef) => {
      const { children, ...rest } = props
      const editableElement = useCreateEditableElement(
        Component,
        props.__source,
        props
      )

      return (
        <EditableElementContext.Provider value={editableElement}>
          <Component
            {...rest}
            {...editableElement.props}
            ref={composeRefs(forwardedRef)}
          >
            {children}
          </Component>
        </EditableElementContext.Provider>
      )
    }
  )
}
