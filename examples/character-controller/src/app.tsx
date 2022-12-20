import { Drafter } from '@draft-n-draw/react';
import { useEditor } from '@react-three/editor';
import { Canvas, Stages } from '@react-three/fiber';
import { CameraController } from 'camera/camera-controller';
import { Collider } from 'collider/collider';
import { InputSystem } from 'input/input-system';
import { PlayerController } from 'player/player-controller';
import { StrictMode, Suspense, useLayoutEffect } from 'react';
import { Fauna } from 'test-assets/fauna';
import Space from 'test-assets/space';
import { SphereCastTest } from 'test-assets/sphere-cast-test';
import { Terrain } from 'test-assets/terrain';
import { TestExtenstionTerrain } from 'test-assets/test-extension-terrain';
import { Wander } from 'test-assets/wander';
import * as THREE from 'three';
import './app.css';
// import { CastTest } from 'test-assets/cast-test';

const FIXED_STEP = 1 / 60;

function Game() {
  // Set fixed step size.
  useLayoutEffect(() => {
    Stages.Fixed.fixedStep = FIXED_STEP;
  }, []);

  const [{ bvh, collider, player }] = useEditor().useSettings('debug', {
    bvh: false,
    collider: false,
    player: false,
  });

  const editor = useEditor().useMode('editor');

  return (
    <Suspense>
      <InputSystem />

      <Fauna />
      <Collider
        debug={{
          bvh: editor && bvh,
          collider: editor && collider,
        }}>
        <Terrain />
        <TestExtenstionTerrain />
      </Collider>

      <PlayerController
        id="player"
        position={[7.278, 2.763, -9.999]}
        walkSpeed={4.631260000000001}
        airControl={0.53}
        capsule={{ radius: 0.25, height: 1.15, center: new THREE.Vector3(0, -0.25, 0) }}
        debug={player}
        // slopeLimit={90}
        // gravity={-1}
      >
        <Wander />
      </PlayerController>
      <CameraController />

      <SphereCastTest origin={[4.65, -1.8, -10.7]} radius={0.25} distance={2} />

      <Space />
      <ambientLight intensity={0.5} />
      <hemisphereLight intensity={0.95} color="#eacb6e" groundColor="red" />
      <spotLight
        castShadow
        color="#edbf6f"
        intensity={200}
        position={[80, 50, -40]}
        angle={0.35}
        penumbra={1}
        shadow-mapSize={[2048 * 2, 2048 * 2]}
        shadow-bias={-0.00001}
        shadow-near={0.5}
        shadow-far={50}
        shadow-left={-20}
        shadow-bottom={-20}
        shadow-right={20}
        shadow-top={20}
      />
    </Suspense>
  );
}

export default function App() {
  return (
    <Canvas shadows gl={{ physicallyCorrectLights: true }}>
      <StrictMode>
        <Drafter>
          <Game />
        </Drafter>
      </StrictMode>
    </Canvas>
  );
}
