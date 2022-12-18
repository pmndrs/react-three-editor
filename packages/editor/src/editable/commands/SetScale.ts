import { Vector3Tuple } from "three"
import { AbstractCommand } from "../CommandManager"
import { EditableElement } from "../EditableElement"
import { Editor } from "../Editor"

export class SetElementScale extends AbstractCommand {
  constructor(
    public editor: Editor,
    public element: EditableElement,
    public scale: Vector3Tuple,
    public oldScale: Vector3Tuple
  ) {
    super(editor)
  }

  execute(redo?: boolean | undefined): void {
    this.element.store?.setValueAtPath("transform.scale", this.scale, false)
    this.element.changeProp(
      "scale",
      this.scale?.map((v: number) => Number(v.toFixed(3)))
    )
  }

  undo(): void {
    this.element.store?.setValueAtPath("transform.scale", this.oldScale, false)
    this.element.changeProp(
      "scale",
      this.oldScale?.map((v: number) => Number(v.toFixed(3)))
    )
  }
}
