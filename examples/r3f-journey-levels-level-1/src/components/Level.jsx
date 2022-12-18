import { useSpring } from "@react-spring/three"
import { useGLTF } from "@react-three/drei"
import { useThree } from "@react-three/fiber"

export default function Level() {
  const { nodes } = useGLTF("/level-react-draco.glb")
  const { camera } = useThree()
  useSpring(
    () => ({
      from: { y: camera.position.y + 5 },
      to: { y: camera.position.y },
      config: { friction: 100 },
      onChange: ({ value }) => (
        (camera.position.y = value.y), camera.lookAt(0, 0, 0)
      )
    }),
    []
  )
  return (
    <mesh
      geometry={nodes.Level.geometry}
      position={[-0.38, 0.69, 0.62]}
      rotation={[Math.PI / 2, -Math.PI / 9, 0]}
      receiveShadow={true}
      castShadow={true}
    >
      <meshStandardMaterial map={nodes.Level.material.map} />
    </mesh>
  )
}
