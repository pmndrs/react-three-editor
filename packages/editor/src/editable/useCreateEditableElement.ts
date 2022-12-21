import { FC, useId, useMemo } from "react"
import { useEditableElement, useEditor } from "./contexts"
import { JSXSource } from "../types"

export const useCreateEditableElement = (
  componentType: string | FC,
  source: JSXSource,
  initialProps: any
) => {
  const id = useId()
  const editor = useEditor()
  const parent = useEditableElement()

  const editableElement = useMemo(
    () => editor.createElement(id, source, componentType, parent.id),
    [componentType, editor, id, source, parent.id]
  )

  return editableElement
}
