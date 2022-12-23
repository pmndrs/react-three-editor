import { useCollider } from 'collider/stores/collider-store';
import * as THREE from 'three';
import { HitInfo } from './objects/hit-info';

// WARNING: This a rough approximation of whay a real sphere cast would be.

export type SphereCastFn = (
  radius: number,
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  maxDistance: number,
) => HitInfo | null;

const MAX_STEPS = 10;
const OVERLAP_RATIO = 0.1;

const store = {
  sphere: new THREE.Sphere(),
  deltaVec: new THREE.Vector3(),
  impactNormal: new THREE.Vector3(),
  impactPoint: new THREE.Vector3(),
};

export const sphereCast: SphereCastFn = (radius, origin, direction, maxDistance) => {
  const { sphere, deltaVec, impactNormal, impactPoint } = store;
  let collision = false;

  // Right now assumes a single collider. We exit if it doesn't have its BVH built yet.
  const collider = useCollider.getState().collider;
  if (!collider?.geometry?.boundsTree) return null;

  sphere.radius = radius;
  sphere.center.copy(origin);
  const diameter = radius * 2;

  const steps = Math.max(Math.min(maxDistance / (diameter - diameter * OVERLAP_RATIO), MAX_STEPS), 1);
  const delta = maxDistance / steps;

  for (let i = 0; i < steps; i++) {
    sphere.center.addScaledVector(direction, delta);
    collision = collider.geometry.boundsTree.shapecast({
      intersectsBounds: (bounds) => bounds.intersectsSphere(sphere),
      intersectsTriangle(tri) {
        tri.closestPointToPoint(sphere.center, impactPoint);
        deltaVec.copy(impactPoint);
        deltaVec.sub(sphere.center);
        const distance = deltaVec.length();
        if (distance < sphere.radius) {
          tri.getNormal(impactNormal);

          return true;
        }
      },
    });
    if (collision) break;
  }

  if (collision) {
    return new HitInfo({
      collider,
      normal: direction,
      location: impactPoint,
      impactNormal,
      impactPoint,
      distance: origin.distanceTo(impactPoint),
    });
  } else {
    return null;
  }
};
