import { Capsule } from 'collider/geometry/capsule';
import { useCollider } from 'collider/stores/collider-store';
import * as THREE from 'three';

export type CapsuleCastParams = {
  radius: number;
  halfHeight: number;
  transform: THREE.Matrix4;
};

export type PenetrationInfo = {
  collider: THREE.Object3D;
  location: THREE.Vector3;
  normal: THREE.Vector3;
  depth: number;
  direction: THREE.Vector3;
};

export type CapsuleCastFn = (radius: number, halfHeight: number, transform: THREE.Matrix4) => PenetrationInfo | null;

const store = {
  capsule: new Capsule(),
  triPoint: new THREE.Vector3(),
  capsulePoint: new THREE.Vector3(),
  segment: new THREE.Line3(),
  aabb: new THREE.Box3(),
  normal: new THREE.Vector3(),
  location: new THREE.Vector3(),
  collision: false,
  depth: 0,
  deltaDirection: new THREE.Vector3(),
};

export const computeCapsulePenetration: CapsuleCastFn = (radius, halfHeight, transform) => {
  let { capsule, triPoint, capsulePoint, segment, aabb, normal, location, collision, depth, deltaDirection } = store;

  // Right now assumes a single collider. We exit if it doesn't have its BVH built yet.
  const collider = useCollider.getState().collider;
  if (!collider?.geometry?.boundsTree) return null;

  capsule.set(radius, halfHeight);
  if (!capsule.isValid) return null;

  capsule.toSegment(segment);
  segment.applyMatrix4(transform);

  aabb.setFromPoints([segment.start, segment.end]);
  aabb.min.addScalar(-radius);
  aabb.max.addScalar(radius);

  collider.geometry.boundsTree.shapecast({
    intersectsBounds: (bounds) => bounds.intersectsBox(aabb),
    intersectsTriangle: (tri) => {
      const distance = tri.closestPointToSegment(segment, triPoint, capsulePoint);

      // If the distance is less than the radius of the capsule, we have a collision.
      if (distance < radius) {
        depth = radius - distance;
        deltaDirection.copy(capsulePoint).sub(triPoint).normalize();

        segment.start.addScaledVector(deltaDirection, depth);
        segment.end.addScaledVector(deltaDirection, depth);

        segment.getCenter(location);
        tri.getNormal(normal);

        collision = true;
      }
    },
  });

  if (collision) {
    return {
      collider,
      depth,
      direction: deltaDirection,
      location,
      normal,
    };
  }
  return null;
};
