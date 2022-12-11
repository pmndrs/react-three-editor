import { useRef } from 'react'
import { Color, AdditiveBlending } from 'three'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Sparkles, shaderMaterial, useGLTF, useTexture } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'

export const App = ({ scale = Array.from({ length: 50 }, () => 0.5 + Math.random() * 4) }) => (
  <Canvas camera={{ fov: 45, position: [-4, 2, -4] }}>
    <Sparkles count={scale.length} size={scale} position={[1.369, 0.174, 2.717]} scale={[4, 1.5, 4]} speed={0.3} />
    {/* <Model /> */}
    <OrbitControls makeDefault />
    <mesh position={[6.948, -2.158, 0.465]}>
      <boxBufferGeometry attach="geometry" />
      <meshStandardMaterial attach="material" color="red" />
    </mesh>
    <directionalLight position={[4.224, 1.912, 3.046]} />
    <ambientLight />
    <Sphere position={[8.817, 1.557, 5.818]} />
  </Canvas>
)

function Model(props) {
  const portalMaterial = useRef()
  const bakedTexture = useTexture('/baked-02.jpeg')
  const { nodes } = useGLTF('/portal-2.glb')
  useFrame((state, delta) => (portalMaterial.current.uTime += delta))
  return (
    <group {...props} dispose={null} position={[0.028, 0.026, 0]} scale={[1.2, 1.2, 1.2]}>
      <mesh geometry={nodes.portalCircle.geometry} position={[1.01, -0.064, 4.577]} rotation={[-1.5707963267948966, 0, 0]}>
        <portalMaterial ref={portalMaterial} blending={AdditiveBlending} uColorStart="pink" uColorEnd="white" />
      </mesh>
      <mesh geometry={nodes.lampLightL.geometry} material-color="#f0bf94" position={[0.508, 0.751, 1.785]} scale={[0.07, 0.11, 0.07]} />
      <mesh geometry={nodes.lampLightR.geometry} material-color="#f0bf94" position={[0.041, 0.178, 2.921]} scale={[-0.07, 0.11, 0.07]} />
      <mesh geometry={nodes.baked.geometry} position={[1.918, -0.55, 1.589]} rotation={[0, 0.14, 0]}>
        <meshBasicMaterial map={bakedTexture} map-flipY={false} />
      </mesh>
    </group>
  )
}

extend({
  // shaderMaterial creates a THREE.ShaderMaterial, and auto-creates uniform setter/getters
  // extend makes it available in JSX, in this case <portalMaterial />
  PortalMaterial: shaderMaterial(
    { uTime: 0, uColorStart: new Color('hotpink'), uColorEnd: new Color('white') },
    glsl`
    varying vec2 vUv;
    void main() {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectionPosition = projectionMatrix * viewPosition;
      gl_Position = projectionPosition;
      vUv = uv;
    }`,
    glsl`
    #pragma glslify: cnoise3 = require(glsl-noise/classic/3d.glsl) 
    uniform float uTime;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    varying vec2 vUv;
    void main() {
      vec2 displacedUv = vUv + cnoise3(vec3(vUv * 7.0, uTime * 0.1));
      float strength = cnoise3(vec3(displacedUv * 5.0, uTime * 0.2));
      float outerGlow = distance(vUv, vec2(0.5)) * 4.0 - 1.4;
      strength += outerGlow;
      strength += step(-0.2, strength) * 0.8;
      strength = clamp(strength, 0.0, 1.0);
      vec3 color = mix(uColorStart, uColorEnd, strength);
      gl_FragColor = vec4(color, 1.0);
    }`,
  ),
})
