import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "./App.css";
import { Lights } from "./components/Lights";
import { Gizmo } from "./components/Gizmo";
import { GUI } from "./components/GUI";
import { Terrain } from "./components/Terrain";

export default function App() {
  return (
    <>
      <GUI />
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [7, 5, 7], near: 0.1, far: 20, fov: 50 }}
      >
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.2}
          enablePan={false}
          minDistance={3}
          maxDistance={12}
          makeDefault
        />
        <Gizmo />
        <Lights />
        <Terrain />
      </Canvas>
    </>
  );
}
