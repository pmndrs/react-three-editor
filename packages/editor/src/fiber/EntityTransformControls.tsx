import { TransformControls } from "@react-three/drei"
import React, { FC, useCallback, useRef } from "react"
import { Event } from "three"
import { TransformControls as TransformControlsImpl } from "three-stdlib"
import { EditableElement } from "./editable-element"
import { useHotkeys } from 'react-hotkeys-hook'

export type EditorTransformControlsProps = {
  entity: EditableElement
}

export const EntityTransformControls: FC<EditorTransformControlsProps> = ( { entity } ) => {
  let ref = useRef<TransformControlsImpl>(null!)

  useHotkeys( 'w,e,r,Escape', ( event, hotkeysEvent ) => {
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
    }
  }, {}, [ entity ] )
  const onChange = useCallback( ( e?: Event ) => {
    if ( e?.type === 'change' && entity.ref && e.target?.object ) {
      entity.setTransformFromControls( e.target.object )
    }
  }, [] )
  return <TransformControls
    key={entity.id}
    object={entity.ref}
    ref={(_ref) => {
      ref.current = _ref as any
      entity.transformControls$ = _ref as any
    }}
    onChange={onChange}
  />
}
