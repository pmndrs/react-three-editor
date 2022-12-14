import { MathUtils, Vector3Tuple } from "three";
import { AbstractCommand } from "../CommandManager";
import { EditableElement } from "../EditableElement";
import { Editor } from "../Editor";

export class SetTransformControls extends AbstractCommand {

    constructor (
        public editor: Editor,
        public element: EditableElement,
        public transform: { position: Vector3Tuple, rotation: Vector3Tuple, scale: Vector3Tuple },
        public oldTransform: { position: Vector3Tuple, rotation: Vector3Tuple, scale: Vector3Tuple }
    ) {
        super(editor)
    }

    execute(redo?: boolean | undefined): void {
      this.element.store?.setValueAtPath("transform.position", this.transform.position, false)
      this.element.dirtyProp(
        "position",
        this.transform.position?.map((v: number) => Number(v.toFixed(3)))
      )

      let radians = this.transform.rotation.map((v) => MathUtils.degToRad(v))
      this.element.store?.setValueAtPath("transform.rotation", this.transform.rotation, false)
      this.element.dirtyProp(
        "rotation",
        radians?.map((v) => Number(v.toFixed(3)))
      )

      this.element.store?.setValueAtPath("transform.scale", this.transform.scale, false)
      this.element.dirtyProp(
        "scale",
        this.transform.scale?.map((v: number) => Number(v.toFixed(3)))
      )
    }

    undo(): void {
      this.element.store?.setValueAtPath("transform.position", this.oldTransform.position, false)
      this.element.dirtyProp(
        "position",
        this.oldTransform.position?.map((v: number) => Number(v.toFixed(3)))
      )

      let radians = this.oldTransform.rotation.map((v) => MathUtils.degToRad(v))
      this.element.store?.setValueAtPath("transform.rotation", this.oldTransform.rotation, false)
      this.element.dirtyProp(
        "rotation",
        radians?.map((v) => Number(v.toFixed(3)))
      )

      this.element.store?.setValueAtPath("transform.scale", this.oldTransform.scale, false)
      this.element.dirtyProp(
        "scale",
        this.oldTransform.scale?.map((v: number) => Number(v.toFixed(3)))
      )
    }

}
