import { useRef } from 'react';
import * as THREE from 'three';

type PlayerProps = {
  radius: number;
  height: number;
};

export function Player({ radius = 0.5, height: length = 0.65 }: PlayerProps) {
  const playerRef = useRef<THREE.Mesh>(null!);

  return (
    <>
      <mesh ref={playerRef} castShadow receiveShadow>
        <capsuleGeometry args={[radius, length, 8, 16]} />
        <meshStandardMaterial />
      </mesh>
      {/* <pointLight intensity={1.2} color="#38e4ed" /> */}
    </>
  );
}
