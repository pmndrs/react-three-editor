import { useFrame, Vector3 } from "@react-three/fiber"
import { RigidBody, RigidBodyApi } from "@react-three/rapier"
import { useRef, useState } from "react"
import { memo } from "../memo"

export function BlockLimbo({ position = [0, 0, 0] }: { position: Vector3 }) {
  const obstacle = useRef<RigidBodyApi>(null)
  const [timeOffset] = useState(() => Math.random() * Math.PI * 2)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    const y = Math.sin(time + timeOffset) + 1.15
    obstacle.current!.setNextKinematicTranslation({
      x: position[0],
      y: y,
      z: position[2]
    })
  })

  return (
    <group position={position}>
      <mesh position={[0, -0.1, 0]} scale={[4, 0.2, 4]} receiveShadow>
        <memo.boxGeometry name="box" />
        <memo.meshStandardMaterial name="floor2Material" color="greenyellow" />
      </mesh>
      <RigidBody
        ref={obstacle}
        type="kinematicPosition"
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      >
        <mesh scale={[3.5, 0.3, 0.3]} receiveShadow castShadow={true}>
          <memo.boxGeometry name="box" />
          <memo.meshStandardMaterial
            name="obstacleMaterial"
            color="orangered"
          />
        </mesh>
      </RigidBody>
    </group>
  )
}
