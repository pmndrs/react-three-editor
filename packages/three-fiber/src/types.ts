import { EditableElement } from "@editable-jsx/editable"
import { Schema } from "leva/plugin"
import { ReactNode } from "react"

export type EditorControlsPlugin<T extends EditableElement = EditableElement> =
  {
    applicable(element: T): boolean
    controls?(element: T): Schema
    icon?(element: T): string
    helper?(props: { element: T }): ReactNode
  }
