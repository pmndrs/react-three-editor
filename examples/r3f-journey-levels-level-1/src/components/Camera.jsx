import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useSpring, a } from '@react-spring/three'

export default function Camera() {
  const { nodes, materials } = useGLTF('/level-react-draco.glb')
  const [spring, api] = useSpring(() => ({ 'rotation-z': 0, config: { friction: 40 } }), [])
  useEffect(() => {
    let timeout
    const wander = () => {
      api.start({ 'rotation-z': Math.random() })
      timeout = setTimeout(wander, (1 + Math.random() * 5) * 1000)
    }
    wander()
    return () => clearTimeout(timeout)
  }, [])
  return (
    <a.group position={[-0.183, 1.054, -0.03]} rotation={[1.5707963267948966, 0, 0.2355235784660854]} {...spring}>
      <mesh geometry={nodes.Camera.geometry} material={nodes.Camera.material} position={[-0.427, 0.232, 0.32]} />
      <mesh geometry={nodes.Camera_1.geometry} material={materials.Lens} />
    </a.group>
  );
}
