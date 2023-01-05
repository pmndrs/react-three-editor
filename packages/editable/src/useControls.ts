import { EditableContext } from "@editable-jsx/editable"
import { useControls as useLevaControls } from "leva"
import { useContext } from "react"

export const useControls: typeof useLevaControls = (...args) => {
  const editor = useContext(EditableContext)
  return (useLevaControls as any)(...args, {
    store: editor?.store
  })
}
