import { MeshWobbleMaterial, useGLTF } from "@react-three/drei"

export default function Cactus() {
  const { nodes, materials } = useGLTF("/level-react-draco.glb")
  return (
    <mesh
      geometry={nodes.Cactus.geometry}
      position={[-0.411, 0.499, -0.581]}
      rotation={[1.5707963267948966, 0, 0]}
      castShadow={true}
    >
      <MeshWobbleMaterial factor={0.4} map={materials.Cactus.map} />
    </mesh>
  )
}
