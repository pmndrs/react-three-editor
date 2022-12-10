import { TransformControls } from "@react-three/drei"
import React, { FC, useCallback, useEffect, useRef } from "react"
import { Euler, Event, MathUtils, Vector3 } from "three"
import { TransformControls as TransformControlsImpl } from "three-stdlib"
import { ChangeSource, EditableElement } from "./editable-element"
import { useHotkeys } from 'react-hotkeys-hook'
import { useCommandHistory } from "./useCommandHistory"
import { SetTransformFromControls } from "./commands"
import { mergeRefs } from "leva/plugin"

export type EditorTransformControlsProps = {
  entity: EditableElement
}

export const EntityTransformControls: FC<EditorTransformControlsProps> = ( { entity } ) => {
  const history = useCommandHistory()
  const oldTransform = useRef<{
    position: Vector3,
    scale: Vector3,
    rotation: Euler
  }>({
    position: new Vector3(),
    scale: new Vector3(),
    rotation: new Euler()
  })
  const ref = useRef<TransformControlsImpl>(null!)

  useHotkeys( 'w,e,r,escape,meta+z,meta+y', ( event, hotkeysEvent ) => {
    console.log( event, hotkeysEvent )
    if ( !ref.current ) return
    event.preventDefault()
    if ( event.key === 'w' ) {
      ref.current.setMode('translate')
    } else if ( event.key === 'e' ) {
      ref.current.setMode('rotate')
    } else if ( event.key === 'r' ) {
      ref.current.setMode('scale')
    } else if ( event.key === 'Escape' ) {
      ref.current.reset()
    } else if ( event.key === 'z' && hotkeysEvent.meta ) {
      history.undo()
    } else if ( event.key === 'y' && hotkeysEvent.meta ) {
      history.redo()
    }

  }, {}, [ entity ] )
  const onChange = useCallback( ( e?: Event ) => {
    if ( e?.type === 'change' && entity.ref && e.target?.object ) {
      entity.setProp(
        "position",
        e.target.object.position.toArray(),
        ChangeSource.TransformControls
      )
      entity.setProp(
        "rotation",
        [
          MathUtils.radToDeg(e.target.object.rotation.x),
          MathUtils.radToDeg(e.target.object.rotation.y),
          MathUtils.radToDeg(e.target.object.rotation.z)
        ],
        ChangeSource.TransformControls
      )
    }
  }, [] )
  useEffect( ( ) => {
    if ( ref.current ) {
      const transformControl = ref.current
      const draggingChanged = ( { value, target }: any ) => {
        if ( value === true ) {
          oldTransform.current.position = target.object.position.clone()
          oldTransform.current.rotation = target.object.rotation.clone()
          oldTransform.current.scale = target.object.scale.clone()
        } else if ( value === false ) {
          history.execute( new SetTransformFromControls( entity, {
            position: target.object.position.clone(),
            rotation: target.object.rotation.clone(),
            scale: target.object.scale.clone()
          }, oldTransform.current ) )
        }
      }
      transformControl.addEventListener('dragging-changed', draggingChanged )
      return ( ) => {
        transformControl.removeEventListener('dragging-changed', draggingChanged )
      }
    }
  }, [] )
  return <TransformControls
    key={entity.id}
    object={entity.ref!}
    ref={mergeRefs([
      ref,
      ( r: TransformControlsImpl ) => {
        entity.transformControls$ = r
      }
    ])}
    onChange={onChange}
  />
}
