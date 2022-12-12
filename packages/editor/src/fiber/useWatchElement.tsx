import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { EditableElement } from "../../editable/EditableElement"
import { eq } from "../../editable/eq"
import { useElementControls } from "../editable/controls/useElementControls"

// function EntityStoreable({ entity }: { entity: EditableElement }) {
//   const entityStore = useElementControls(entity)

//   newFunction(entity)

//   return null
// }
// function useWatchEntity(entity: EditableElement<any>) {
//   useFrame(function editorControlsSystem() {
//     if (entity.ref && entity.ref instanceof THREE.Object3D) {
//       let state = entity.store?.getData()
//       if (!state) return

//       let position = entity.getProp("position", false)
//       let edit = false
//       if (!eq.array(position, state["transform.position"]?.value)) {
//         state["transform.position"].disabled = true
//         state["transform.position"].value = position
//         edit = true
//       }

//       if (edit) {
//         console.log("reading", position)
//         entity.store?.useStore.setState({
//           data: state
//         })
//       }
//     }
//   })
// }
