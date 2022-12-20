import { Box } from '@react-three/drei';
// import { Stages, useUpdate } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function Steps({
  stepHeight = 0.1,
  position = [0, 0, 0],
}: {
  stepHeight?: number;
  position?: THREE.Vector3 | [x: number, y: number, z: number];
}) {
  return (
    <group name="Steps" position={position}>
      {/* @ts-ignore */}
      <Box args={[1, stepHeight, 1]} position={[0, stepHeight * 1, 0]} receiveShadow castShadow>
        <meshStandardMaterial color={"rgb(6, 161, 196)"} />
      </Box>
      {/* @ts-ignore */}
      <Box args={[1, stepHeight, 1]} position={[0, stepHeight * 2, -stepHeight * 1]} receiveShadow castShadow>
        <meshStandardMaterial color="pink" />
      </Box>
      {/* @ts-ignore */}
      <Box args={[1, stepHeight, 1]} position={[0, stepHeight * 3, -stepHeight * 2]} receiveShadow castShadow>
        <meshStandardMaterial color="pink" />
      </Box>
    </group>
  );
}

export function TestExtenstionTerrain() {
  const platformARef = useRef<THREE.Mesh>(null!);
  const platformBRef = useRef<THREE.Mesh>(null!);

  // useUpdate(function updateTerrain(state) {
  //   const time = state.clock.getElapsedTime();
  //   platformARef.current.position.x = Math.sin(time);
  //   platformBRef.current.position.y = Math.sin(time) + 1.2;
  // }, Stages.Fixed);

  return (
    <>
      <group position={[2, -0.427, -5.5]} rotation={[0, -0.15, 0]}>
        {/* @ts-ignore */}
        <Box name="Floor Platform" ref={platformARef} args={[4, 0.5, 4]} receiveShadow castShadow>
          <meshStandardMaterial color="white" />
        </Box>
        {/* @ts-ignore */}
        <Box
          name="Elevator Platform"
          ref={platformBRef}
          args={[1.5, 0.25, 1]}
          position={[4, 2.052, -7.2]}
          receiveShadow
          castShadow>
          <meshStandardMaterial color="white" />
        </Box>
        {/* @ts-ignore */}
        <Box name="Floor" args={[12, 0.25, 6]} position={[0, 0, -5]} receiveShadow castShadow>
          <meshStandardMaterial color="white" />
        </Box>
        {/* @ts-ignore */}
        <Box
          name="Wall"
          args={[8, 0.5, 12]}
          position={[0, -0.1, -8]}
          rotation={[0, Math.PI / 2, Math.PI / 2]}
          receiveShadow
          castShadow>
          <meshStandardMaterial color="white" />
        </Box>
        {/* @ts-ignore */}
        <Box
          name="Steep Ramp"
          args={[5, 0.01, 1.4]}
          position={[1.146, 1, -5.433]}
          rotation={[0, Math.PI / 2, 0.9]}
          receiveShadow
          castShadow>
          <meshStandardMaterial color="white" />
        </Box>
        {/* @ts-ignore */}
        <Box
          name="Ramp"
          args={[4, 0.25, 1.8]}
          position={[-1, 1, -6.4]}
          rotation={[0, Math.PI / 2, 0.6]}
          receiveShadow
          castShadow>
          <meshStandardMaterial color="white" />
        </Box>

        <Steps position={[-3, 0, -7.25]} stepHeight={0.2} />
        <Steps position={[-4, -0.05, -7.25]} stepHeight={0.3} />
      </group>
      <Box
        name="Test"
        args={[0.25, 0.25, 0.25]}
        position={[5.64, -1.74, -11.5]}
        rotation={[0, Math.PI / 2, 0.6]}
        receiveShadow
        castShadow>
        <meshStandardMaterial color="white" />
      </Box>
    </>
  );
}
