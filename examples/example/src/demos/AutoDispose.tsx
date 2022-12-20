import { Canvas, useFrame } from "@react-three/editor/fiber"
import React, { useRef, useState } from "react"
import * as THREE from "three"
function Box1(props: any) {
  const mesh = useRef<THREE.Mesh>(null!)
  const [hovered, setHover] = useState(false)
  useFrame(
    (state) => (mesh.current.position.y = Math.sin(state.clock.elapsedTime))
  )
  return (
    <mesh
      {...props}
      ref={mesh}
      onClick={(e) => props.setActive(!props.active)}
      onPointerOver={(e) => setHover(true)}
      onPointerOut={(e) => setHover(false)}
    >
      <boxGeometry />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  )
}
export function Box2(props: any) {
  const mesh = useRef<THREE.Mesh>(null!)
  const [hovered, setHover] = useState(false)
  useFrame(
    (state) => (mesh.current.position.y = Math.sin(state.clock.elapsedTime))
  )
  return (
    <group {...props}>
      <mesh
        {...props}
        ref={mesh}
        onClick={(e) => props.setActive(!props.active)}
        onPointerOver={(e) => setHover(true)}
        onPointerOut={(e) => setHover(false)}
      >
        <boxGeometry />
        <meshStandardMaterial
          color={hovered ? "green" : "blue"}
          wireframe={false}
        />
      </mesh>
    </group>
  )
}
function Switcher() {
  const [active, setActive] = useState(false)
  return (
    <>
      {active && (
        <Box1 active={active} setActive={setActive} position={[-0.5, 0, 0]} />
      )}
      {!active && (
        <Box2
          active={active}
          setActive={setActive}
          position={[0.43410156250000065, 0.6498046875000001, 0]}
          scale={[1, 1, 1]}
          rotation={[0, 0, 0]}
        />
      )}
    </>
  )
}
export default function App() {
  return (
    <>
      <Canvas
        orthographic
        camera={{
          zoom: 100
        }}
      >
        <ambientLight />
        <Switcher />
      </Canvas>
    </>
  )
}
