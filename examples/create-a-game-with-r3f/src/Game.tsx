import { OrbitControls, Sphere } from "@react-three/drei"
import { EditorRoot } from "@react-three/editor/fiber"
import { useFrame, useThree } from "@react-three/fiber"
import { Physics } from "@react-three/rapier"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { TestTerrain } from "./test-terrain"

export const store = {
  canvas: null as null | HTMLCanvasElement,
  isDragging: false
}

export function Game() {
  const sphereRef = useRef<THREE.Mesh>(null!)
  const dLightRef = useRef<THREE.DirectionalLight>(null!)
  const aLightRef = useRef<THREE.AmbientLight>(null!)

  const [raycaster] = useState(() => {
    const _raycaster = new THREE.Raycaster()
    _raycaster.layers.set(0)
    return _raycaster
  })
  const [gameStore] = useState(() => ({ isHovered: false }))
  const state = useThree()

  useEffect(() => {
    console.log(store.canvas)
    const handler = () => (gameStore.isHovered = true)
    if (store.canvas) store.canvas.addEventListener("pointermove", handler)

    return () => {
      if (store.canvas) store.canvas.removeEventListener("pointermove", handler)
    }
  }, [])

  // There should be a better way to enable layers.
  useEffect(() => {
    sphereRef.current.layers.set(1)
    state.camera.layers.enable(1)
    dLightRef.current.layers.enable(1)
    aLightRef.current.layers.enable(1)
  }, [])

  useFrame(({ pointer, camera, scene }) => {
    if (!store.isDragging) gameStore.isHovered = false
    console.log(gameStore.isHovered)

    sphereRef.current.visible = store.isDragging && gameStore.isHovered

    if (store.isDragging && gameStore.isHovered) {
      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(scene.children)
      let point

      if (intersects.length !== 0) {
        point = intersects[0].point
      } else {
        const vector = new THREE.Vector3(pointer.x, pointer.y, 0.1).unproject(
          camera
        )
        const dir = vector.sub(camera.position).normalize()
        const distance = -camera.position.z / dir.z
        const pos = camera.position.clone().add(dir.multiplyScalar(distance))
        point = pos
      }

      sphereRef.current.position.copy(point)
    }
  })

  return (
    <Physics>
      <EditorRoot>
        <TestTerrain />
        <Sphere ref={sphereRef} args={[1]} visible={false} />

        <ambientLight ref={aLightRef} intensity={0.5} />
        <directionalLight
          ref={dLightRef}
          position={[0, 10, 0]}
          intensity={0.5}
          castShadow={true}
        />

        <OrbitControls />
      </EditorRoot>
    </Physics>
  )
}
