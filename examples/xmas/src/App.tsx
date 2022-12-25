import { Suspense, useLayoutEffect, useState } from "react";

import { Canvas, extend, useLoader } from "@react-three/fiber";
import { Model } from "./model";
import {
  ContactShadows,
  Effects,
  Environment,
  Loader,
  OrbitControls,
} from "@react-three/drei";
import Html from "./html";
import { UnrealBloomPass } from "three-stdlib";

extend({ UnrealBloomPass });

function App() {
  return (
    <>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 5, 6] }}>
        <Suspense fallback={null}>
          <Model />
          <ambientLight intensity={0.35} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            shadow-mapSize={[512, 512]}
            castShadow
          />
          <Environment preset="dawn" />
          <ContactShadows
            position={[0, -0.5, 0]}
            opacity={0.4}
            scale={10}
            blur={4}
            far={4}
            color="red"
          />
          {/* <Effects disableGamma>
            <unrealBloomPass threshold={1} strength={1.0} radius={0.5} />
          </Effects> */}
          <OrbitControls
            enableZoom={false}
            autoRotate
            minPolarAngle={Math.PI / 2 - 0.5}
            maxPolarAngle={Math.PI / 2 - 0.5}
          />
        </Suspense>
      </Canvas>
      <Loader
        containerStyles={{ background: "#e6e4ef" }}
        dataStyles={{ color: "#417469" }}
        innerStyles={{ background: "#e6e4ef" }}
        barStyles={{ background: "#417469" }}
      />
      {/* <div className="html">
        <Html />
      </div> */}
    </>
  );
}

export default App;
