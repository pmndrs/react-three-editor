import { KeyboardControls } from "@react-three/drei"
import {
  CameraGizmos,
  Editor,
  ScenePanel,
  SelectedElementControls
} from "@react-three/editor"
import { Canvas } from "@react-three/fiber"
import ReactDOM from "react-dom/client"
import Experience from "./Experience.js"
import "./style.css"
const root = ReactDOM.createRoot(document.querySelector("#root"))

root.render(
  <KeyboardControls
    map={[
      {
        name: "forward",
        keys: ["KeyW", "ArrowUp"]
      },
      {
        name: "backward",
        keys: ["KeyS", "ArrowDown"]
      },
      {
        name: "leftward",
        keys: ["KeyA", "ArrowLeft"]
      },
      {
        name: "rightward",
        keys: ["KeyD", "ArrowRight"]
      },
      {
        name: "jump",
        keys: ["Space"]
      }
    ]}
  >
    <Canvas
      shadows
      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [2.5, 4, 6]
      }}
    >
      <Experience />

      {/* Editor UI (can be used to override the default layout/editor parts) */}
      <Editor>
        {/* Scene tree in its own panel */}
        <ScenePanel />

        {/* Controls for selected element in the default leva panel */}
        <SelectedElementControls />

        <CameraGizmos />
      </Editor>
    </Canvas>
  </KeyboardControls>
)
