import { KeyboardControls } from "@react-three/drei"
import "@react-three/editor/rapier"
import { Canvas } from "@react-three/fiber"
import ReactDOM from "react-dom/client"
import { Game, store } from "./Game.js"
import { ImageList } from "./Imagelist.js"
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
    <Window>
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
    <ImageList />
  </KeyboardControls>
)
