import React, { useContext } from "react"
import { EditableElement } from "../editable/EditableElement"
import { TransformControls } from "@react-three/drei"
import { TransformControls as TransformControlsImpl } from "three-stdlib"
import { MathUtils, Event, Object3D, Vector3Tuple } from "three"
import { eq } from "../editable/eq"
import { useHotkeys } from 'react-hotkeys-hook'
import { EditorContext } from "../editable/contexts"
import { SetTransformCommand } from "../editable/commands"

const serializeTransform = ( object?: Object3D ): { position: Vector3Tuple, rotation: Vector3Tuple, scale: Vector3Tuple } => ({
  position: object?.position.toArray() || [0,0,0],
  rotation: object?.rotation.toArray().map( r => MathUtils.radToDeg( r ) ).slice(0, 3) as Vector3Tuple || [0,0,0],
  scale: object?.position.toArray() || [1,1,1],
})

export type ElementTransformControlsProps = {
  element: EditableElement
}

export function ElementTransformControls({ element }: ElementTransformControlsProps) {
  const ref = React.useRef<TransformControlsImpl>(null!)
  const editor = useContext( EditorContext )

  useHotkeys('w', ( ) => ref.current.setMode('translate'))
  useHotkeys('e', ( ) => ref.current.setMode('rotate'))
  useHotkeys('r', ( ) => ref.current.setMode('scale'))
  useHotkeys('-', ( ) => ref.current.setSize(Math.max((ref.current as any).size - 0.1, 0.1)))
  useHotkeys('=', ( ) => ref.current.setSize((ref.current as any).size + 0.1))
  useHotkeys('meta+z', ( ) => {
    console.log( editor?.commandManager )
    editor?.commandManager.undo()
  } )
  useHotkeys('meta+y', ( ) => editor?.commandManager.redo() )

  const oldTransform = React.useRef<{
    position: [x: number, y: number, y: number],
    rotation: [x: number, y: number, y: number],
    scale: [x: number, y: number, y: number]
  }>({
    position: [0,0,0],
    rotation: [0,0,0],
    scale: [1,1,1]
  })

  const updateElementTransforms = React.useCallback( ( object: Object3D ) => {
    const { position, rotation, scale } = serializeTransform( object )
    if (eq.array(element.store?.get("transform.position"), position))
      return
    // when we get an update from the transform controls, we know that the `ref` and the
    // transformControls are correctly set. We need to set the leva controls, mark it dirty,
    // and set the props if needed
    element.store?.setValueAtPath("transform.position", position, false)
    element.dirtyProp(
      "position",
      position?.map((v: number) => Number(v.toFixed(3)))
    )

    if (eq.angles(element.store?.get("transform.rotation"), rotation))
      return
    // when we get an update from the transform controls, we know that the `ref` and the
    // transformControls are correctly set. We need to set the leva controls, mark it dirty,
    // and set the props if needed
    let radians = rotation.map((v) => MathUtils.degToRad(v))
    element.store?.setValueAtPath("transform.rotation", rotation, false)
    element.dirtyProp(
      "rotation",
      radians?.map((v) => Number(v.toFixed(3)))
    )

    if (eq.array(element.store?.get("transform.scale"), scale)) return
    // when we get an update from the transform controls, we know that the `ref` and the
    // transformControls are correctly set. We need to set the leva controls, mark it dirty,
    // and set the props if needed
    element.store?.setValueAtPath("transform.scale", scale, false)
    element.dirtyProp(
      "scale",
      scale?.map((v: number) => Number(v.toFixed(3)))
    )
  }, [ element ] )

  // React.useEffect( ( ) => {
  //   if ( ref.current ) {
  //     const control = ref.current
  //     const draggingChanged = ( event: Event & { value?: boolean } ) => {
  //       if ( event.value ) {
  //         // Dragging has started lets take store the current position
  //         oldTransform.current = serializeTransform( event.target.object )
  //       } else {
  //         // Dragging has stopped lets store add this to history
  //         editor?.commandManager.execute( new SetTransformCommand( editor, element, serializeTransform(event.target.object), oldTransform.current ))
  //       }
  //     }
  //     control.addEventListener('dragging-changed', draggingChanged)
  //     return ( ) => {
  //       control.removeEventListener('dragging-changed', draggingChanged)
  //     }
  //   }
  // }, [ element ] )

  const onChange = React.useCallback( ( event?: Event ) => {
    if (event?.type === "change" && element.ref && event.target?.object) {
      updateElementTransforms( event.target.object )
    }
  }, [ updateElementTransforms ] )

  return (
    <TransformControls
      object={element.ref!}
      ref={ref}
      onChange={onChange}
    />
  )
}
