import { useGLTF } from "@react-three/drei"
import { Vector3 } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { memo } from "../memo"

export function BlockEnd({ position }: { position: Vector3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} scale={[4, 0.2, 4]} receiveShadow>
        <memo.boxGeometry />
        <memo.meshStandardMaterial color="limegreen" />
      </mesh>
      <RigidBody type="fixed" colliders="hull" position={[0, 1, 0]}>
        <primitive
          object={useGLTF("/models/character.glb").scene}
          scale={0.2}
          position={[0, -0.4, 0]}
        />
      </RigidBody>
    </group>
  )
}
