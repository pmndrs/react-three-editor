import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Stages, useThree, useUpdate } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImp } from 'three-stdlib';
import { useCameraController } from './stores/camera-store';

export function CameraController() {
  const controlsRef = useRef<OrbitControlsImp>(null!);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const target = useCameraController((state) => state.target);
  const { set, camera } = useThree(({ set, camera }) => ({ set, camera }));

  useLayoutEffect(() => {
    const oldCam = camera;
    set(() => ({ camera: cameraRef.current }));
    return () => set(() => ({ camera: oldCam }));
  }, [camera, set]);

  useUpdate(() => {
    if (!target) return;
    cameraRef.current.position.sub(controlsRef.current.target);
    controlsRef.current.target.copy(target.position);
    cameraRef.current.position.add(target.position);
  }, Stages.Update);

  return (
    <>
      {/* @ts-ignore */}
      <PerspectiveCamera fov={75} ref={cameraRef} position={[2, 3, -2]} />
      <OrbitControls
        dampingFactor={0.1}
        ref={controlsRef}
        camera={cameraRef.current}
        minDistance={1}
        maxDistance={3}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}
