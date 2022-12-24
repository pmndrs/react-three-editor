import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { MathUtils } from "three"
import { eq } from "../editable"
import { EditableElement } from "../editable/EditableElement"

export function useElementObserver(entity: EditableElement<any>) {
  useFrame(function editorControlsSystem() {
    if (entity.ref && entity.ref instanceof THREE.Object3D) {
      entity.store?.useStore.setState((d) => {
        let state = d.data
        if (!state) return

        let edit = false

        if (entity.ref?.name?.length && state["name"] !== entity.ref.name) {
          state["name"].disabled = true
          state["name"].value = entity.ref.name
          edit = true
        }

        let position = entity.ref.position.toArray()
        if (
          state["transform.position"] &&
          !eq.array(position, state["transform.position"]?.value)
        ) {
          state["transform.position"].disabled = true
          state["transform.position"].value = position
          edit = true
        }

        let rotation = [
          MathUtils.radToDeg(entity.ref.rotation.x),
          MathUtils.radToDeg(entity.ref.rotation.y),
          MathUtils.radToDeg(entity.ref.rotation.z)
        ]

        if (
          state["transform.rotation"] &&
          !eq.angles(rotation, state["transform.rotation"]?.value)
        ) {
          state["transform.rotation"].disabled = true
          state["transform.rotation"].value = rotation
          edit = true
        }

        let scale = entity.ref.scale.toArray()

        if (
          state["transform.scale"] &&
          !eq.array(scale, state["transform.scale"]?.value)
        ) {
          state["transform.scale"].disabled = true
          state["transform.scale"].value = scale
          edit = true
        }

        if (edit) {
          return { date: state }
        }

        return d
      })
    }
  })
}
