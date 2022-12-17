import { OrbitControls, useGLTF } from "@react-three/drei"
import { extendControls } from "@react-three/editor"
import { useFrame, Vector3 } from "@react-three/fiber"
import {
  CuboidCollider,
  Debug,
  Physics,
  RigidBody,
  RigidBodyApi
} from "@react-three/rapier"
import { useRef, useState } from "react"
import { Euler, Quaternion } from "three"
import Lights from "./Lights.js"
import { memo } from "./memo"
import { Player } from "./Player"

extendControls(RigidBody, {
  mass: { value: 1, min: 0, max: 100, step: 0.1, type: "number" },
  friction: { value: 0.5, min: 0, max: 1, step: 0.01, type: "number" },
  restitution: { value: 0.5, min: 0, max: 1, step: 0.01, type: "number" },
  linearDamping: { value: 0.1, min: 0, max: 1, step: 0.01, type: "number" },
  angularDamping: { value: 0.1, min: 0, max: 1, step: 0.01, type: "number" }
})

const boxGeometry = <memo.boxGeometry name="box" />

function BlockStart({ position = [0, 0, 0] as Vector3 }) {
  return (
    <group position={position}>
      <mesh
        receiveShadow
        castShadow={false}
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
      >
        {boxGeometry}
        <memo.meshStandardMaterial name="floor1Material" color="limegreen" />
      </mesh>
    </group>
  )
}

const rotation = new Quaternion()

function BlockSpinner({ position = [0, 0, 0] }: { position: Vector3 }) {
  const obstacle = useRef<RigidBodyApi>()
  const [speed] = useState(
    () => (Math.random() + 0.2) * (Math.random() < 0.5 ? -1 : 1)
  )
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    rotation.setFromEuler(new Euler(0, time * speed, 0))
    obstacle.current?.setNextKinematicRotation(rotation)
  })

  return (
    <group position={position}>
      <mesh position={[0, -0.1, 0]} scale={[4, 0.2, 4]} receiveShadow>
        <memo.boxGeometry name="box" />
        <memo.meshStandardMaterial name="floor2Material" color="greenyellow" />
      </mesh>

      <RigidBody
        ref={obstacle}
        type="kinematicPosition"
        position={[0, 0.3, 0]}
        restitution={0.7}
        mass={39}
      >
        <mesh
          position={[0, 0, 0]}
          scale={[3.5, 0.3, 0.3]}
          receiveShadow
          castShadow={true}
        >
          <memo.boxGeometry name="box" />
          <memo.meshStandardMaterial
            name="obstacleMaterial"
            color="orangered"
          />
        </mesh>
      </RigidBody>
    </group>
  )
}

function BlockAxe({ position = [0, 0, 0] }: { position: Vector3 }) {
  const obstacle = useRef<RigidBodyApi>(null)
  const [timeOffset] = useState(() => Math.random() * Math.PI * 2)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    const x = Math.sin(time + timeOffset) * 1.25
    obstacle.current!.setNextKinematicTranslation({
      x: position[0] + x,
      y: position[1] + 0.75,
      z: position[2]
    })
  })

  return (
    <group position={position}>
      <mesh position={[0, -0.1, 0]} scale={[4, 0.2, 4]} receiveShadow>
        <memo.boxGeometry name="box" />
        <memo.meshStandardMaterial
          name="floor2Material"
          color={"rgb(147, 63, 63)"}
        />
      </mesh>
      <RigidBody ref={obstacle} type="kinematicPosition">
        <mesh scale={[1.5, 1.5, 0.3]} receiveShadow castShadow={true}>
          <memo.boxGeometry name="box" />
          <memo.meshStandardMaterial
            name="obstacleMaterial"
            color="orangered"
          />
        </mesh>
      </RigidBody>
    </group>
  )
}

function BlockLimbo({ position = [0, 0, 0] }: { position: Vector3 }) {
  const obstacle = useRef<RigidBodyApi>(null)
  const [timeOffset] = useState(() => Math.random() * Math.PI * 2)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    const y = Math.sin(time + timeOffset) + 1.15
    obstacle.current!.setNextKinematicTranslation({
      x: position[0],
      y: y,
      z: position[2]
    })
  })

  return (
    <group position={position}>
      <mesh position={[0, -0.1, 0]} scale={[4, 0.2, 4]} receiveShadow>
        <memo.boxGeometry name="box" />
        <memo.meshStandardMaterial name="floor2Material" color="greenyellow" />
      </mesh>
      <RigidBody ref={obstacle} type="kinematicPosition">
        <mesh scale={[3.5, 0.3, 0.3]} receiveShadow castShadow={true}>
          <memo.boxGeometry name="box" />
          <memo.meshStandardMaterial
            name="obstacleMaterial"
            color="orangered"
          />
        </mesh>
      </RigidBody>
    </group>
  )
}

function BlockEnd({ position }: { position: Vector3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} scale={[4, 0.2, 4]} receiveShadow>
        <memo.boxGeometry name="box" />
        <memo.meshStandardMaterial name="floor1Material" color="limegreen" />
      </mesh>
      <RigidBody type="fixed" colliders="hull" position={[0, 2.076, 0]}>
        <primitive
          object={useGLTF("/hamburger.glb").scene}
          scale={0.2}
          position={[0, -1.897, 0]}
        />
      </RigidBody>
    </group>
  )
}

function Bounds({ length = 1 }) {
  return (
    <>
      <RigidBody type="fixed">
        <mesh
          position={[2.15, 0.75, -(length * 2) + 2]}
          scale={[0.3, 1.5, 4 * length]}
          receiveShadow
        >
          <memo.boxGeometry name="box" />
          <memo.meshStandardMaterial name="wallMaterial" color="slategrey" />
        </mesh>
        <mesh
          position={[-2.15, 0.75, -(length * 2) + 2]}
          scale={[0.3, 1.5, 4 * length]}
          receiveShadow
        >
          <memo.boxGeometry name="box" />
          <memo.meshStandardMaterial name="wallMaterial" color="slategrey" />
        </mesh>
        <mesh
          position={[0, 0.75, -(length * 4) + 2]}
          scale={[4, 1.5, 0.3]}
          receiveShadow
        >
          <memo.boxGeometry name="box" />
          <memo.meshStandardMaterial
            name="wallMaterial"
            color={"rgb(109, 103, 141)"}
          />
        </mesh>
        <CuboidCollider
          args={[2, 0.1, 2 * length]}
          position={[0, -0.1, -(length * 2) + 2]}
          restitution={0.2}
          friction={1}
        />
      </RigidBody>
    </>
  )
}

function Level() {
  return (
    <>
      <BlockStart position={[0, 0, 0]} />
      <BlockLimbo position={[0, 0, -4]} />
      <BlockSpinner position={[0, 0, -8]} />
      <BlockSpinner position={[0, 0, -12]} />
      <BlockAxe position={[0, 0, -16]} />
      <BlockEnd position={[0, 0, -20]} />
      <Bounds length={6} name={"bounds"} />
    </>
  )
}

export default function Experience() {
  return (
    <>
      <OrbitControls makeDefault />
      <Physics>
        <Debug />
        <Level />
        <Lights />
        <Player />
        {/* <gridHelper /> */}
      </Physics>
    </>
  )
}
