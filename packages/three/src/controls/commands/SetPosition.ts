import {
  EditableElement,
  Editor,
  ExecutableCommand
} from "@editable-jsx/editable"
import { Vector3Tuple } from "three"

export class SetElementPosition extends ExecutableCommand {
  constructor(
    public editor: Editor,
    public element: EditableElement,
    public position: Vector3Tuple,
    public oldPosition: Vector3Tuple
  ) {
    super(editor)
  }

  execute(redo?: boolean | undefined): void {
    this.element.properties.setValueAtPath(
      "transform.position",
      this.position,
      false
    )
    this.element.changeProp(
      "position",
      this.position?.map((v: number) => Number(v.toFixed(3)))
    )
  }

  undo(): void {
    this.element.properties.setValueAtPath(
      "transform.position",
      this.oldPosition,
      false
    )
    this.element.changeProp(
      "position",
      this.oldPosition.map((v: number) => Number(v.toFixed(3)))
    )
  }
}
