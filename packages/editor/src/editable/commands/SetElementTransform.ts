import { MathUtils, Vector3Tuple } from "three"
import { EditableElement } from "../EditableElement"
import { Editor } from "../Editor"
import { AbstractCommand } from "../HistoryManager"

export class SetTransformControls extends AbstractCommand {
  constructor(
    public editor: Editor,
    public element: EditableElement,
    public transform: {
      position: Vector3Tuple
      rotation: Vector3Tuple
      scale: Vector3Tuple
    },
    public oldTransform: {
      position: Vector3Tuple
      rotation: Vector3Tuple
      scale: Vector3Tuple
    }
  ) {
    super(editor)
  }

  execute(redo?: boolean | undefined): void {
    this.element.store?.setValueAtPath(
      "transform.position",
      this.transform.position,
      false
    )
    this.element.changeProp(
      "position",
      this.transform.position?.map((v: number) => Number(v.toFixed(3)))
    )

    let radians = this.transform.rotation.map((v) => MathUtils.degToRad(v))
    this.element.store?.setValueAtPath(
      "transform.rotation",
      this.transform.rotation,
      false
    )
    this.element.changeProp(
      "rotation",
      radians?.map((v) => Number(v.toFixed(3)))
    )

    this.element.store?.setValueAtPath(
      "transform.scale",
      this.transform.scale,
      false
    )
    this.element.changeProp(
      "scale",
      this.transform.scale?.map((v: number) => Number(v.toFixed(3)))
    )
  }

  undo(): void {
    this.element.store?.setValueAtPath(
      "transform.position",
      this.oldTransform.position,
      false
    )
    this.element.changeProp(
      "position",
      this.oldTransform.position?.map((v: number) => Number(v.toFixed(3)))
    )

    let radians = this.oldTransform.rotation.map((v) => MathUtils.degToRad(v))
    this.element.store?.setValueAtPath(
      "transform.rotation",
      this.oldTransform.rotation,
      false
    )
    this.element.changeProp(
      "rotation",
      radians?.map((v) => Number(v.toFixed(3)))
    )

    this.element.store?.setValueAtPath(
      "transform.scale",
      this.oldTransform.scale,
      false
    )
    this.element.changeProp(
      "scale",
      this.oldTransform.scale?.map((v: number) => Number(v.toFixed(3)))
    )
  }
}
