import { MathUtils, Vector3Tuple } from "three";
import { AbstractCommand } from "../CommandManager";
import { EditableElement } from "../EditableElement";
import { Editor } from "../Editor";

export class SetElementRotation extends AbstractCommand {

    constructor (
        public editor: Editor,
        public element: EditableElement,
        public rotation: Vector3Tuple,
        public oldRotaion: Vector3Tuple
    ) {
        super(editor)
    }

    execute(redo?: boolean | undefined): void {
      let radians = this.rotation.map((v) => MathUtils.degToRad(v))
      this.element.store?.setValueAtPath("transform.rotation", this.rotation, false)
      this.element.dirtyProp(
        "rotation",
        radians?.map((v) => Number(v.toFixed(3)))
      )
    }

    undo(): void {

      let radians = this.oldRotaion.map((v) => MathUtils.degToRad(v))
      this.element.store?.setValueAtPath("transform.rotation", this.oldRotaion, false)
      this.element.dirtyProp(
        "rotation",
        radians?.map((v) => Number(v.toFixed(3)))
      )
    }

}
