import { Schema } from "leva/plugin"
import { ReactNode } from "react"
import { EditableElement } from "../editable/EditableElement"

export type EditorControlsPlugin = {
  applicable(element: EditableElement): boolean
  controls?(element: EditableElement): Schema
  icon?(element: EditableElement): string
  helper?(props: { element: EditableElement }): ReactNode
}
