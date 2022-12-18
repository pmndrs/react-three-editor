import { Schema } from "leva/plugin"
import { EditableElement } from "../editable/EditableElement"

export type EditorControlsPlugin = {
  applicable(element: EditableElement): boolean
  controls(element: EditableElement): Schema
}
