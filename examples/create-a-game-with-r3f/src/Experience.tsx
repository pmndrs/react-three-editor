import { OrbitControls } from "@react-three/drei"
import { EditorRoot, extendControls } from "@react-three/editor"
import { Physics, RigidBody } from "@react-three/rapier"
import { BlockAxe } from "./components/BlockAxe.js"
import { BlockEnd } from "./components/BlockEnd.js"
import { BlockLimbo } from "./components/BlockLimbo.js"
import { BlockSpinner } from "./components/BlockSpinner.js"
import { BlockStart } from "./components/BlockStart.js"
import { Bounds } from "./components/Bounds.js"
import Lights from "./Lights.js"
import { Player } from "./Player.js"

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
      <BlockStart position={[0, 0.426, 0]} />
      <BlockLimbo position={[0, -0.003, -4]} />
      <BlockSpinner position={[0, 0, -8]} />
      <BlockSpinner position={[0, 0, -12]} />
      <BlockAxe position={[0, 0, -16]} />
      <BlockEnd position={[0.0, 0, -20]} />
      <Bounds length={6} name={"yo!"} />
    </>
  )
}

export default function Experience() {
  return (
    <>
      <OrbitControls makeDefault />
      <Physics>
        <EditorRoot>
          <Level />
          <Lights />
        </EditorRoot>
        <Player />
        {/* <gridHelper /> */}
      </Physics>
    </>
  )
}
