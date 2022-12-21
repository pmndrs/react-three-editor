import { OrbitControls, PivotControls } from "@react-three/drei";
import { extendControls } from "@react-three/editor"
import { Physics, RigidBody } from "@react-three/rapier"
import { BlockAxe } from "./components/BlockAxe"
import { BlockEnd } from "./components/BlockEnd"
import { BlockLimbo } from "./components/BlockLimbo"
import { BlockSpinner } from "./components/BlockSpinner"
import { BlockStart } from "./components/BlockStart"
import { Bounds } from "./components/Bounds"
import Lights from "./Lights.js"
import { Player } from "./Player"

extendControls(RigidBody, {
  mass: { value: 1, min: 0, max: 100, step: 0.1, type: "number" },
  friction: { value: 0.5, min: 0, max: 1, step: 0.01, type: "number" },
  restitution: { value: 0.5, min: 0, max: 1, step: 0.01, type: "number" },
  linearDamping: { value: 0.1, min: 0, max: 1, step: 0.01, type: "number" },
  angularDamping: { value: 0.1, min: 0, max: 1, step: 0.01, type: "number" }
})

function Level() {
  return (
    <>
      <BlockStart position={[0, 0, 0]} />
      <BlockLimbo position={[0, 0, -4]} />
      <BlockSpinner position={[0, 0, -8]} />
      <BlockSpinner position={[0, 0, -12]} />
      <BlockAxe position={[0, 0, -16]} />
      <BlockEnd position={[0.0, 0, -20]} />
      <Bounds length={6} name={"bounds"} />
    </>
  )
}

export default function Experience() {
  return (
    <>
      <OrbitControls makeDefault />
      <Physics>
        <Level />
        <Lights />
        <Player />
        {/* <gridHelper /> */}
      </Physics>
    </>
  )
}
