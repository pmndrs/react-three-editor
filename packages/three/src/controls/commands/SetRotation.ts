import {
  EditableElement,
  Editor,
  ExecutableCommand
} from "@editable-jsx/editable"
import { MathUtils, Vector3Tuple } from "three"

export class SetElementRotation extends ExecutableCommand {
  constructor(
    public editor: Editor,
    public element: EditableElement,
    public rotation: Vector3Tuple,
    public oldRotaion: Vector3Tuple
  ) {
    super(editor)
  }

  execute(redo?: boolean | undefined): void {
    let radians = this.rotation.map((v) => MathUtils.degToRad(v))
    this.element.properties.setValueAtPath(
      "transform.rotation",
      this.rotation,
      false
    )
    this.element.changeProp(
      "rotation",
      radians?.map((v) => Number(v.toFixed(3)))
    )
  }

  undo(): void {
    let radians = this.oldRotaion.map((v) => MathUtils.degToRad(v))
    this.element.properties.setValueAtPath(
      "transform.rotation",
      this.oldRotaion,
      false
    )
    this.element.changeProp(
      "rotation",
      radians?.map((v) => Number(v.toFixed(3)))
    )
  }
}
