import { useKeyboardControls } from "@react-three/drei"
import { useEditor } from "@react-three/editor"
import { addPlugin } from "@react-three/editor/src/plugins"
import { useFrame } from "@react-three/fiber"
import { RigidBody, RigidBodyApi, useRapier } from "@react-three/rapier"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import { memo } from "./memo"

addPlugin({
  applicable: (e) => e.type === "icosahedronGeometry",
  controls: (el) => {
    return {
      args: {
        value: el.currentProps.args,
        render: () => false
      },
      radius: {
        value: el.currentProps.args[0],
        min: 0,
        max: 10,
        step: 0.1,
        onChange: (val, path, context) => {
          if (!context.initial && context.fromPanel) {
            el.changeProp("args", [
              val,
              el.props.args?.[1] ?? el.currentProps.args[1]
            ])
          }
        }
      },
      detail: {
        value: el.currentProps.args[1],
        min: 0,
        max: 10,
        step: 1,
        onChange: (val, path, context) => {
          if (!context.initial && context.fromPanel) {
            el.changeProp("args", [
              el.props.args?.[0] ?? el.currentProps.args[0],
              val
            ])
          }
        }
      }
    }
  }
})

export function Player() {
  const [subscribeKeys, getKeys] = useKeyboardControls()
  const body = useRef<RigidBodyApi>(null)
  const { rapier, world } = useRapier()
  const rapierWorld = world.raw()
  const editor = useEditor()

  useEffect(() => {
    return subscribeKeys(
      (s) => s.jump,
      (val) => {
        if (val) {
          const origin = body.current!.translation()
          origin.y -= 0.31
          const direction = new THREE.Vector3(0, -1, 0)
          const ray = new rapier.Ray(origin, direction)
          // editor.debug(ray, {
          //   persist: 1
          // })
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
      position={[-0.469, 1.69, -0.518]}
      mass={0.1}
    >
      <mesh castShadow>
        <icosahedronGeometry args={[0.55, 3]} />
        <memo.meshStandardMaterial
          flatShading={true}
          color="mediumpurple"
          transparent={true}
          opacity={0.7}
        />
      </mesh>
    </RigidBody>
  )
}
