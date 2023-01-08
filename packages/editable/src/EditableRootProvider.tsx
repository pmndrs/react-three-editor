import { PropsWithChildren } from "react"
import { EditableContext } from "./EditableContext"
import { EditableRoot, EditableRootContext } from "./EditableRoot"

export function EditableRootProvider({
  root,
  children
}: PropsWithChildren<{ root: EditableRoot }>) {
  return (
    <EditableRootContext.Provider value={root}>
      <EditableContext.Provider value={root}>
        {children}
      </EditableContext.Provider>
    </EditableRootContext.Provider>
  )
}
