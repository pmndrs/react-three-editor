import {
  EditableElement,
  Editor,
  ExecutableCommand
} from "@editable-jsx/editable"
import { Vector3Tuple } from "three"

export class SetElementScale extends ExecutableCommand {
  constructor(
    public editor: Editor,
    public element: EditableElement,
    public scale: Vector3Tuple,
    public oldScale: Vector3Tuple
  ) {
    super(editor)
  }

  execute(redo?: boolean | undefined): void {
    this.element.properties.setValueAtPath("transform.scale", this.scale, false)
    this.element.changeProp(
      "scale",
      this.scale?.map((v: number) => Number(v.toFixed(3)))
    )
  }

  undo(): void {
    this.element.properties.setValueAtPath(
      "transform.scale",
      this.oldScale,
      false
    )
    this.element.changeProp(
      "scale",
      this.oldScale?.map((v: number) => Number(v.toFixed(3)))
    )
  }
}
