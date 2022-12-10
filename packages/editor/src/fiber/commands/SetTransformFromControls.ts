import { Euler, Vector3 } from "three";
import { AbstractCommand } from "../command-manager";
import { EditableElement } from "../editable-element";

type Object3DTransform = {
    position: Vector3
    rotation: Euler
    scale: Vector3
}


export class SetTransformFromControls extends AbstractCommand<EditableElement> {
    transform: Object3DTransform
    oldTransform: Object3DTransform
    constructor ( entity: EditableElement, transform: Object3DTransform, oldTransform: Object3DTransform ) {
        super( entity )
        this.transform = transform
        this.oldTransform = oldTransform
    }

    execute(isRedo?: boolean | undefined): void {
        this.context.ref.position.copy( this.transform.position )
        this.context.ref.rotation.copy( this.transform.rotation )
        this.context.ref.scale.copy( this.transform.scale )
    }

    undo(): void {
        this.context.ref.position.copy( this.oldTransform.position )
        this.context.ref.rotation.copy( this.oldTransform.rotation )
        this.context.ref.scale.copy( this.oldTransform.scale )
    }
}
