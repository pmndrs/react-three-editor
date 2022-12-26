import { memo } from "@react-three/editor/fiber"
import { Vector3 } from "@react-three/fiber"

export const boxGeometry = <memo.boxGeometry />

export function BlockStart({ position = [0, 0, 0] as Vector3 }) {
  return (
    <group position={position}>
      <mesh
        receiveShadow
        castShadow={false}
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
      >
        {boxGeometry}
        <memo.meshStandardMaterial color="limegreen" />
      </mesh>
    </group>
  )
}
