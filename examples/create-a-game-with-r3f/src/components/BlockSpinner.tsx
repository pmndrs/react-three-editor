import { useFrame, Vector3 } from "@react-three/fiber"
import { RigidBody, RigidBodyApi } from "@react-three/rapier"
import { useRef, useState } from "react"
import { Euler, Quaternion } from "three"
import { memo } from "../memo"

export const rotation = new Quaternion()

export function BlockSpinner({ position = [0, 0, 0] }: { position: Vector3 }) {
  const obstacle = useRef<RigidBodyApi>()
  const [speed] = useState(
    () => (Math.random() + 0.2) * (Math.random() < 0.5 ? -1 : 1)
  )
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    rotation.setFromEuler(new Euler(0, time * speed, 0))
    obstacle.current?.setNextKinematicRotation(rotation)
  })

  return (
    <group position={position}>
      <mesh position={[0, -0.1, 0]} scale={[4, 0.2, 4]} receiveShadow>
        <boxGeometry name="box" />
        <memo.meshStandardMaterial name="floor2Material" color="greenyellow" />
      </mesh>

      <RigidBody
        ref={obstacle}
        type="kinematicPosition"
        rotation={[0, 0, 0]}
        position={[0, 0.3, 0]}
        restitution={0.7}
        mass={39}
      >
        <mesh
          position={[0, 0, 0]}
          scale={[3.5, 0.3, 0.3]}
          receiveShadow
          castShadow={true}
        >
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
