import { useControls as useLevaControls } from "leva"
import React from "react"
import { EditableElementContext } from "../contexts"

export const useControls: typeof useLevaControls = (...args) => {
  const editor = React.useContext(EditableElementContext)
  return (useLevaControls as any)(...args, {
    store: editor?.store
  })
}
