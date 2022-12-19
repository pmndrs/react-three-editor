import { Canvas } from "@react-three/fiber"
import Cactus from "./components/Cactus"
import Camera from "./components/Camera"
import Icon from "./components/Icon"
import Level from "./components/Level"
import Pyramid from "./components/Pyramid"
import Sudo from "./components/Sudo"

import {
  Center,
  OrbitControls,
  PivotControls,
  softShadows,
  useGLTF
} from "@react-three/drei"
import { useControls } from "leva"
import { useRef } from "react"

softShadows()

/*
function ObjPivot({ object, onDrag, ...props }) {
  const pivotRef = useRef()
  useEffect(() => {
    if (object?.current) {
      const target = object.current
      const pivot = pivotRef.current
      const doesUpdate = target.matrixAutoUpdate
      target.updateWorldMatrix(true, true)
      pivot.matrix = target.matrix.clone()
      target.matrixAutoUpdate = false
      return () => {
        if (doesUpdate) {
          target.matrixAutoUpdate = true
          target.matrix.decompose(target.position, target.quaternion, target.scale)
        }
      }
    }
  }, [object])
  const drag = useCallback(
    (local, deltaL, world, deltaW) => {
      object.current.matrix.copy(local)
      if (onDrag) onDrag(local, deltaL, world, deltaW)
    },
    [object]
  )
  return <PivotControls ref={pivotRef} onDrag={drag} {...props} />
}
*/

export default function App() {
  const ref = useRef()
  const { attach } = useControls({ attach: false })
  return (
    <Canvas
      shadows
      raycaster={{ params: { Line: { threshold: 0.15 } } }}
      camera={{ position: [-10, 10, 10], fov: 20 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        position={[-2.261, 4.57, 0.658]}
        intensity={1.5}
        shadow-mapSize={[1024, 1024]}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-5, 5, 5, -5, 1, 50]}
        />
      </directionalLight>

      <mesh scale={20} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry />
        <shadowMaterial transparent opacity={0.5} />
      </mesh>

      <PivotControls
        rotation={[0, -Math.PI / 2, 0]}
        anchor={[1, -1, -1]}
        scale={75}
        depthTest={false}
        fixed
        lineWidth={2}
      >
        <mesh castShadow receiveShadow position={[-1, 0.5, 1]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={"rgb(246, 148, 255)"} metalness={0.4} />
        </mesh>
      </PivotControls>

      <PivotControls
        object={attach ? ref : undefined}
        visible={attach}
        rotation={[0, -Math.PI / 2, 0]}
        scale={75}
        depthTest={false}
        fixed
        lineWidth={2}
      />
      <mesh ref={ref} position={[0.75, 0.5, 1]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial />
      </mesh>

      <PivotControls
        activeAxes={[true, true, false]}
        depthTest={false}
        anchor={[0, 0, 0]}
        scale={0.75}
      >
        <Center top position={[1.5, 0, 0]}>
          <mesh castShadow receiveShadow>
            <dodecahedronGeometry args={[0.5]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </Center>
      </PivotControls>

      <PivotControls
        anchor={[1, 1, 1]}
        rotation={[Math.PI, -Math.PI / 2, 0]}
        scale={0.75}
      >
        <Center top scale={1.5} position={[-0.5, 0, -1]}>
          <Cup />
        </Center>
      </PivotControls>

      <OrbitControls makeDefault />
    </Canvas>
  )
}

function Cup(props) {
  const { nodes, materials } = useGLTF("/coffee-transformed.glb")
  return (
    <mesh
      receiveShadow
      castShadow={true}
      geometry={nodes.coffee_cup_top_16oz.geometry}
      material={materials["13 - Default"]}
      {...props}
      dispose={null}
    />
  )
}

export function pp() {
  return (
    <Canvas flat dpr={[1, 2]} camera={{ fov: 25, position: [0, 0, 8] }}>
      <color attach="background" args={["#e0b7ff"]} />
      <mesh position={[-1.621, -0.794, -2.006]}>
        <sphereGeometry />
        <meshStandardMaterial />
      </mesh>
      <directionalLight castShadow={true} />
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
