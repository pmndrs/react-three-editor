import "@editable-jsx/rapier"
import { KeyboardControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import ReactDOM from "react-dom/client"
import Experience from "./Experience"
import "./style.css"
const root = ReactDOM.createRoot(document.querySelector("#root"))

export function Window({ children }: { children: React.ReactNode }) {
  return <div className="Window">{children}</div>
}

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
      ref={(node) => {
        console.log("hereee")
        // store.canvas = node
      }}
      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [2.5, 4, 6]
      }}
    >
      <Experience />
    </Canvas>
    {/* <Window>
      <div className="App">
        <Canvas
          ref={(node) => {
            console.log("hereee")
            store.canvas = node
          }}
          camera={{
            fov: 45,
            near: 0.1,
            far: 200,
            position: [2.5, 4, 6]
          }}
        >
          <Game />
        </Canvas>
      </div>
    </Window>
    <ImageList /> */}
  </KeyboardControls>
)
