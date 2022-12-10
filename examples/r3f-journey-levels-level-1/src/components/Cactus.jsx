import { MeshWobbleMaterial, useGLTF } from "@react-three/drei"

export default function Cactus() {
  const { nodes, materials } = useGLTF("/level-react-draco.glb")
  return (
    <mesh
      geometry={nodes.Cactus.geometry}
      position={[2.12, 1.882, 0.352]}
      rotation={[1.5707963267948966, 0, 0]}>
      <MeshWobbleMaterial factor={0.4} map={materials.Cactus.map} />
    </mesh>
  );
}
