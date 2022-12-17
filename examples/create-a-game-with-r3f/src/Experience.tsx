import {
  OrbitControls,
  Sparkles,
  useGLTF,
  useKeyboardControls
} from "@react-three/drei"
import { extendControls, useEditor } from "@react-three/editor"
import { ThreeElements, useFrame, Vector3 } from "@react-three/fiber"
import {
  CuboidCollider,
  Debug,
  Physics,
  RigidBody,
  RigidBodyApi,
  useRapier
} from "@react-three/rapier"
import { createElement, forwardRef, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import Lights from "./Lights.js"
const cache = {}

extendControls(RigidBody, {
  mass: { value: 1, min: 0, max: 100, step: 0.1, type: "number" },
  friction: { value: 0.5, min: 0, max: 1, step: 0.01, type: "number" },
  restitution: { value: 0.5, min: 0, max: 1, step: 0.01, type: "number" },
  linearDamping: { value: 0.1, min: 0, max: 1, step: 0.01, type: "number" },
  angularDamping: { value: 0.1, min: 0, max: 1, step: 0.01, type: "number" }
})

const memo: {
  [k in keyof ThreeElements]: React.FC<React.PropsWithRef<ThreeElements[k]>>
} = new Proxy(
  {} as unknown as {
    [k in keyof ThreeElements]: React.PropsWithRef<ThreeElements[k]>
  },
  {
    get: (obj: any, prop: string) => {
      if (obj[prop]) {
        return obj[prop]
      }

      obj[prop] = ({ name, args, ...props }: any, ref) => {
        let cachedKey = `${prop}:${name}`
        if (!cache[cachedKey]) {
          let className = prop.charAt(0).toUpperCase() + prop.slice(1)
          cache[cachedKey] = new THREE[className](...(args ?? []))
        }
        return createElement("primitive", {
          object: cache[cachedKey],
          name: name,
          ...props,
          ref: ref
        })
      }

      obj[prop].displayName = prop

      obj[prop] = forwardRef(obj[prop])

      return obj[prop]
    }
  }
)

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

const rotation = new THREE.Quaternion()

function BlockSpinner({ position = [0, 0, 0] }) {
  const obstacle = useRef<RigidBodyApi>()
  const [speed] = useState(
    () => (Math.random() + 0.2) * (Math.random() < 0.5 ? -1 : 1)
  )
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    rotation.setFromEuler(new THREE.Euler(0, time * speed, 0))
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

function BlockAxe({ position = [0, 0, 0] }) {
  const obstacle = useRef()
  const [timeOffset] = useState(() => Math.random() * Math.PI * 2)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    const x = Math.sin(time + timeOffset) * 1.25
    obstacle.current.setNextKinematicTranslation({
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

function BlockLimbo({ position = [0, 0, 0] }) {
  const obstacle = useRef()
  const [timeOffset] = useState(() => Math.random() * Math.PI * 2)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    const y = Math.sin(time + timeOffset) + 1.15
    obstacle.current.setNextKinematicTranslation({
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

function BlockEnd({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} scale={[4, 0.2, 4]} receiveShadow>
        <memo.boxGeometry name="box" />
        <memo.meshStandardMaterial name="floor1Material" color="limegreen" />
      </mesh>
      <RigidBody type="fixed" colliders="hull" position={[0, 0.25, 0]}>
        <primitive object={useGLTF("/hamburger.glb").scene} scale={0.2} />
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
      <BlockStart position={[0, 0, 3.008]} />
      <BlockLimbo position={[0, 0, -4]} />
      <BlockSpinner position={[0, 0, -8]} />
      <BlockSpinner position={[0, 0, -12]} />
      <BlockAxe position={[0, 0, -16]} />
      <BlockEnd position={[0, 0, -20]} />
      <Bounds length={6} name={"bounds"} />
    </>
  )
}

function Player() {
  const [subscribeKeys, getKeys] = useKeyboardControls()
  const body = useRef<RigidBodyApi>(null)
  const { rapier, world } = useRapier()
  const rapierWorld = world.raw()
  const editor = useEditor()

  useEffect(() => {
    return subscribeKeys(
      (s) => s.jump,
      (val) => {
        if (val) {
          const origin = body.current!.translation()
          origin.y -= 0.31
          const direction = new THREE.Vector3(0, -1, 0)
          const ray = new rapier.Ray(origin, direction)
          editor.debugRay(
            {
              origin,
              direction,
              distance: 10
            },
            {
              persist: 1
            }
          )
          const hit = rapierWorld.castRay(ray, 10, true)
          if ((hit?.toi ?? 0) < 0.15) {
            body.current!.applyImpulse({
              x: 0,
              y: 0.5,
              z: 0
            })
          }
        }
      }
    )
  }, [])

  useFrame((_, delta) => {
    const { forward, backward, leftward, rightward } = getKeys()
    const impulse = { x: 0, y: 0, z: 0 }
    const torque = { x: 0, y: 0, z: 0 }

    const impulseStrength = 0.6 * delta
    const torqueStrength = 0.2 * delta

    if (forward) {
      impulse.z -= impulseStrength
      torque.x -= torqueStrength
    }

    if (backward) {
      impulse.z += impulseStrength
      torque.x += torqueStrength
    }

    if (rightward) {
      impulse.x += impulseStrength
      torque.z -= torqueStrength
    }

    if (leftward) {
      impulse.x -= impulseStrength
      torque.z += torqueStrength
    }

    body.current?.applyImpulse(impulse)
    body.current?.applyTorqueImpulse(torque)

    const cameraPosition = new THREE.Vector3()

    cameraPosition.copy(body.current!.translation())
    cameraPosition.z += 2.25
    cameraPosition.y += 0.65
  })

  return (
    <RigidBody
      ref={body}
      colliders="ball"
      restitution={0.2}
      friction={1}
      position={[1.3, 0.5, 0.9]}
    >
      <mesh castShadow>
        <icosahedronGeometry name="player" args={[0.3, 1]} />
        <memo.meshStandardMaterial
          name="player"
          flatShading={true}
          color="mediumpurple"
        />
      </mesh>
      <Sparkles
        count={100}
        name="sparkles"
        castShadow
        position={[-0.382, 0.646, -0.16]}
      />
    </RigidBody>
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
