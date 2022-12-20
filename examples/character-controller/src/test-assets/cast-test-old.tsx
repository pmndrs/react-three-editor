import { Sphere } from '@react-three/drei';
import { applyProps, useUpdate } from '@react-three/fiber';
import { Instance } from '@react-three/fiber/dist/declarations/src/core/renderer';
import { HitInfo } from 'character/character-controller';
import { capsuleCast } from 'collider/scene-queries/capsule-cast-old';
import { capsuleCastMTD } from 'collider/scene-queries/capsule-cast-mtd';
import { CapsuleCastDebug } from 'collider/scene-queries/debug/capsule-cast-debug';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type CastTestProps = {
  position?: THREE.Vector3 | [x: number, y: number, z: number];
  radius?: number;
  halfHeight?: number;
  maxDistance?: number;
  direction?: [number, number, number];
  autoUpdate?: boolean;
};

export function CastTest({
  position,
  radius = 0.25,
  halfHeight = 0.25,
  maxDistance = 6,
  autoUpdate = false,
  direction = [0, 0, -1],
}: CastTestProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const hitInfoRef = useRef<HitInfo | null>(null);
  const [store] = useState({ direction: new THREE.Vector3(...direction) });
  const [isInit, setIsInit] = useState(false);

  useEffect(() => {
    if (!autoUpdate) {
      applyProps(ref.current as unknown as Instance, { position });
      ref.current.updateMatrix();
      [hitInfoRef.current] = capsuleCastMTD(radius, halfHeight, ref.current.matrix, store.direction, maxDistance);
    }
    setIsInit(true);
  }, [halfHeight, isInit, radius, store, position, autoUpdate, maxDistance]);

  useEffect(() => {
    store.direction.set(...direction);
  }, [direction, store]);

  useUpdate(() => {
    if (!autoUpdate) return;
    [hitInfoRef.current] = capsuleCastMTD(radius, halfHeight, ref.current.matrix, store.direction, maxDistance);
  });

  return (
    <>
      {/* @ts-ignore */}
      <Sphere ref={ref} args={[radius]} position={position}>
        <meshStandardMaterial />
      </Sphere>
      {isInit && (
        <CapsuleCastDebug
          radius={radius}
          halfHeight={halfHeight}
          transform={ref.current.matrix}
          direction={store.direction}
          maxDistance={maxDistance}
          hitInfoRef={hitInfoRef}
        />
      )}
    </>
  );
}
