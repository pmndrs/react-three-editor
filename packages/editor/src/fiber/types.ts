import { EditableElement } from "@editable-jsx/core/EditableElement"
import { Schema } from "leva/plugin"
import { ReactNode } from "react"

export type EditorControlsPlugin = {
  applicable(element: EditableElement): boolean
  controls?(element: EditableElement): Schema
  icon?(element: EditableElement): string
  helper?(props: { element: EditableElement }): ReactNode
}
