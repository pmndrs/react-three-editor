import { useCollider } from 'collider/stores/collider-store';
import * as THREE from 'three';
import { HitInfo } from './objects/hit-info';

export type RaycastFn = (origin: THREE.Vector3, direction: THREE.Vector3, maxDistance: number) => HitInfo | null;

const store = {
  raycaster: new THREE.Raycaster(),
};

export const raycast: RaycastFn = (origin, direction, maxDistance) => {
  const { raycaster } = store;

  // TODO: Support multiple colliders.
  const collider = useCollider.getState().collider;
  if (!collider) return null;

  raycaster.set(origin, direction);
  raycaster.far = maxDistance;
  raycaster.firstHitOnly = true;
  const hit = raycaster.intersectObject(collider, false);

  if (hit.length > 0 && hit[0].face) {
    return new HitInfo({
      collider,
      normal: direction,
      impactPoint: hit[0].point,
      location: hit[0].point,
      impactNormal: hit[0].face.normal,
      distance: hit[0].distance,
    });
  }
  return null;
};
