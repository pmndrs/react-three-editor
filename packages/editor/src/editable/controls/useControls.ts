import { useControls as useLevaControls } from "leva"
import React from "react"
import { EditableElementContext } from "../contexts"

export function useControls(...args) {
  const editor = React.useContext(EditableElementContext)
  return useLevaControls(...args, {
    store: editor?.store
  })
}
