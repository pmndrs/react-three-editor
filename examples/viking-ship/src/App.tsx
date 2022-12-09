import * as THREE from "three"
import React, { Suspense, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Loader } from "@react-three/drei"
import Model from "./Model"

function Rig({ children }) {
  const outer = useRef<THREE.Group>(null!)
  const inner = useRef<THREE.Group>(null!)
  useFrame(({ camera, clock }) => {
    outer.current.position.y = THREE.MathUtils.lerp(outer.current.position.y, 0, 0.01)
    inner.current.rotation.y = Math.sin(clock.getElapsedTime() / 8) * Math.PI
    inner.current.position.z = 5 + -Math.sin(clock.getElapsedTime() / 2) * 10
    inner.current.position.y = -5 + Math.sin(clock.getElapsedTime() / 2) * 2
  })
  return (
    <group position={[0.005, 0.062, 0]} ref={outer} rotation={[-1.8500490071139892, 0, 0]} scale={[1.1, 1, 1]}>
      <group ref={inner}>{children}</group>
    </group>
  );
}

export default function App() {
  return (
    <>
      <Canvas linear camera={{ position: [0, 15, 30], fov: 70 }}>
        <color attach="background" args={[0xfff0ea]} />
        <fog attach="fog" args={[0xfff0ea, 10, 60]} />
        <ambientLight intensity={6} />
        <Suspense fallback={null}>
          <Rig>
            <Model />
            <mesh scale={[1000, 1000, 1]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry />
              <meshBasicMaterial transparent opacity={0.7} color="skyblue" />
            </mesh>
          </Rig>
        </Suspense>
      </Canvas>
      <Loader />
    </>
  )
}
