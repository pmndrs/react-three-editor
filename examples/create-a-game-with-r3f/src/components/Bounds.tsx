import { CuboidCollider, RigidBody } from "@react-three/rapier"
import { memo } from "../memo"

export function Bounds({ length = 1 }) {
  return (
    <>
      <RigidBody type="fixed" position={[0, 0, 0]}>
        <mesh
          position={[2.107, 0.75, -10]}
          scale={[0.3, 1.5, 4 * length]}
          receiveShadow
        >
          <memo.boxGeometry name="box" />
          <memo.meshStandardMaterial name="wallMaterial" color="slategrey" />
        </mesh>
        <mesh
          position={[-2.15, 0.75, -(length * 2) + 2]}
          scale={[0.3, 1.5, 4 * length]}
          receiveShadow
        >
          <memo.boxGeometry name="box" />
          <memo.meshStandardMaterial name="wallMaterial" color="slategrey" />
        </mesh>
        <mesh
          position={[0, 0.75, -(length * 4) + 2]}
          scale={[4, 1.5, 0.3]}
          receiveShadow
        >
          <memo.boxGeometry name="box" />
          <memo.meshStandardMaterial
            name="wallMaterial"
            color={"rgb(109, 103, 141)"}
          />
        </mesh>
        <CuboidCollider
          args={[2, 0.1, 2 * length]}
          position={[0, -0.1, -(length * 2) + 2]}
          restitution={0.2}
          friction={1}
        />
      </RigidBody>
    </>
  );
}
