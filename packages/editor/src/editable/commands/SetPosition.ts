import { Vector3Tuple } from "three"
import { AbstractCommand } from "../CommandManager"
import { EditableElement } from "../EditableElement"
import { Editor } from "../Editor"

export class SetElementPosition extends AbstractCommand {
  constructor(
    public editor: Editor,
    public element: EditableElement,
    public position: Vector3Tuple,
    public oldPosition: Vector3Tuple
  ) {
    super(editor)
  }

  execute(redo?: boolean | undefined): void {
    this.element.store?.setValueAtPath(
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
    this.element.store?.setValueAtPath(
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
