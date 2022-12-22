import { useControls as useLevaControls } from "leva"
import { useContext } from "react"
import { EditableElementContext } from "../EditableElementContext"

export const useControls: typeof useLevaControls = (...args) => {
  const editor = useContext(EditableElementContext)
  return (useLevaControls as any)(...args, {
    store: editor?.store
  })
}
