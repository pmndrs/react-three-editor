import { useUpdate } from '@react-three/fiber';
import { SphereCaster } from 'collider/scene-queries/sphere-caster';
import { SphereCaster as SphereCasterM } from 'collider/scene-queries/gl-matrix-test/sphere-caster-gl-matrix';
import { useCollider } from 'collider/stores/collider-store';
import { useEffect, useState } from 'react';
import * as THREE from 'three';

type SphereCastTestProps = {
  origin?: [number, number, number];
  radius?: number;
  distance?: number;
  direction?: [number, number, number];
  autoUpdate?: boolean;
};

export function SphereCastTest({
  origin = [0, 0, 0],
  radius = 0.25,
  distance = 6,
  direction = [0, 0, -1],
}: SphereCastTestProps) {
  const [store] = useState(() => ({
    origin: new THREE.Vector3(...origin),
    direction: new THREE.Vector3(...direction),
  }));
  const [sphereCaster] = useState(() => new SphereCaster(radius, store.origin, store.direction, distance));

  const collider = useCollider((state) => state.collider);

  useEffect(() => {
    store.origin.set(...origin);
    sphereCaster.origin = store.origin;
    sphereCaster.needsUpdate = true;
  }, [origin, store, sphereCaster]);

  useEffect(() => {
    store.direction.set(...direction);
    sphereCaster.direction = store.direction;
    sphereCaster.needsUpdate = true;
  }, [direction, store, sphereCaster]);

  useEffect(() => {
    sphereCaster.distance = distance;
    sphereCaster.needsUpdate = true;
  }, [distance, store, sphereCaster]);

  useUpdate((state) => {
    const pulse = Math.sin(Math.PI * 0.1 * state.clock.getElapsedTime());
    sphereCaster.origin.x = pulse + origin[0];
    sphereCaster.needsUpdate = true;

    if (collider) sphereCaster.intersectMesh(collider);
  });

  return null;
}
