import { Sparkles, useKeyboardControls } from "@react-three/drei"
import { useEditor } from "@react-three/editor"
import { useFrame } from "@react-three/fiber"
import { RigidBody, RigidBodyApi, useRapier } from "@react-three/rapier"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { memo } from "./memo"

export function Player() {
  const [subscribeKeys, getKeys] = useKeyboardControls()
  const body = useRef<RigidBodyApi>(null)
  const { rapier, world } = useRapier()
  const rapierWorld = world.raw()
  const editor = useEditor()

  useMemo(() => {
    let plugin = {
      applicable: (e) => e instanceof rapier.Ray,
      debug: (info: typeof rapier.Ray, v: any, editor) => {
        let ray = {
          origin: info.origin,
          direction: info.dir,
          distance: 10
        }
        editor.drafter.drawRay(ray, v)
        return () => {
          editor.drafter.dispose(ray)
        }
      }
    }

    editor.addPlugin(plugin)
    return () => {
      editor.plugins = editor.plugins.filter((p) => p !== plugin)
    }
  }, [editor, rapier])

  useEffect(() => {
    return subscribeKeys(
      (s) => s.jump,
      (val) => {
        if (val) {
          const origin = body.current!.translation()
          origin.y -= 0.31
          const direction = new THREE.Vector3(0, -1, 0)
          const ray = new rapier.Ray(origin, direction)
          editor.debug(ray, {
            persist: 1
          })
          const hit = rapierWorld.castRay(ray, 10, true)
          if ((hit?.toi ?? 0) < 0.15) {
            body.current!.applyImpulse({
              x: 0,
              y: 0.5,
              z: 0
            })
          }
        }
      }
    )
  }, [])

  useFrame((_, delta) => {
    const { forward, backward, leftward, rightward } = getKeys()
    const impulse = { x: 0, y: 0, z: 0 }
    const torque = { x: 0, y: 0, z: 0 }

    const impulseStrength = 0.6 * delta
    const torqueStrength = 0.2 * delta

    if (forward) {
      impulse.z -= impulseStrength
      torque.x -= torqueStrength
    }

    if (backward) {
      impulse.z += impulseStrength
      torque.x += torqueStrength
    }

    if (rightward) {
      impulse.x += impulseStrength
      torque.z -= torqueStrength
    }

    if (leftward) {
      impulse.x -= impulseStrength
      torque.z += torqueStrength
    }

    body.current?.applyImpulse(impulse)
    body.current?.applyTorqueImpulse(torque)

    const cameraPosition = new THREE.Vector3()

    cameraPosition.copy(body.current!.translation())
    cameraPosition.z += 2.25
    cameraPosition.y += 0.65
  })

  return (
    <RigidBody
      ref={body}
      colliders="ball"
      restitution={0.2}
      friction={1}
      position={[-0.593, 1.357, -0.088]}
      mass={0.1}
    >
      <mesh castShadow>
        <icosahedronGeometry name="player" args={[0.3, 1]} />
        <memo.meshStandardMaterial
          name="player"
          flatShading={true}
          color="mediumpurple"
          transparent={true}
          opacity={0.7}
        />
      </mesh>
      <Sparkles
        count={100}
        name="sparkles"
        castShadow
        position={[0.256, 0.486, 0.167]}
      />
    </RigidBody>
  )
}
