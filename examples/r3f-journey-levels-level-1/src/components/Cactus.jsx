import { MeshWobbleMaterial, useGLTF } from "@react-three/drei"

export default function Cactus() {
  const { nodes, materials } = useGLTF("/level-react-draco.glb")
  console.log(materials)
  return (
    <mesh
      geometry={nodes.Cactus.geometry}
      position={[0.687, 0.96, 2.251]}
      rotation={[1.5707963267948966, 0, 0]}
    >
      <MeshWobbleMaterial factor={0.4} map={materials.Cactus.map} />
    </mesh>
  )
}
