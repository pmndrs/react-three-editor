import { Canvas } from "@react-three/fiber"
import Cactus from "./components/Cactus"
import Camera from "./components/Camera"
import Icon from "./components/Icon"
import Level from "./components/Level"
import Pyramid from "./components/Pyramid"
import Sudo from "./components/Sudo"

export default function App() {
  return (
    <Canvas flat dpr={[1, 2]} camera={{ fov: 25, position: [0, 0, 8] }}>
      <color attach="background" args={["#e0b7ff"]} />
      <mesh position={[-1.621, -0.794, -2.006]}>
        <sphereGeometry />
        <meshStandardMaterial />
      </mesh>
      <directionalLight />
      <ambientLight />
      <group
        global
        makeDefault
        zoom={0.8}
        rotation={[0, -Math.PI / 4, 0]}
        polar={[0, Math.PI / 4]}
        azimuth={[-Math.PI / 4, Math.PI / 4]}
      >
        <group position-y={-0.75} dispose={null}>
          <Level />
          <Sudo />
          <Camera />
          <Cactus />
          <Icon />
          <Pyramid />
        </group>
      </group>
    </Canvas>
  )
}
