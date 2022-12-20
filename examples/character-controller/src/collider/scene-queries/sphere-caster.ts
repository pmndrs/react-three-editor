import { getDrafter } from '@draft-n-draw/react';
import * as THREE from 'three';
import { ExtendedTriangle } from 'three-mesh-bvh';

const drafter = getDrafter();

const pool = { vecA: new THREE.Vector3(), vecB: new THREE.Vector3(), vecC: new THREE.Vector3() };

// Solves a quadratic equation and returns the lowest root between 0 and maxR.
function getLowestRoot(a: number, b: number, c: number, maxR: number) {
  const determinant = b * b - 4 * a * c;

  if (determinant < 0) {
    return null;
  }

  const sqrtD = Math.sqrt(determinant);
  let root1 = (-b - sqrtD) / (2 * a);
  let root2 = (-b + sqrtD) / (2 * a);

  if (root1 > root2) {
    const temp = root2;
    root2 = root1;
    root1 = temp;
  }

  if (root1 > 0 && root1 < maxR) {
    return root1;
  }

  if (root2 > 0 && root2 < maxR) {
    return root2;
  }

  return null;
}

function testVertex(
  vertex: THREE.Vector3,
  velocityLengthSqr: number,
  t: number,
  origin: THREE.Vector3,
  velocity: THREE.Vector3,
  caster: SphereCaster,
) {
  const vecA = pool.vecA.subVectors(origin, vertex);
  const a = velocityLengthSqr;
  const b = 2 * vecA.dot(velocity);
  const c = vecA.lengthSq() - 1;

  const newT = getLowestRoot(a, b, c, t);

  if (newT !== null) {
    caster.setCollision(newT, vertex);
    return newT;
  }

  return t;
}

function testEdge(
  vertexA: THREE.Vector3,
  vertexB: THREE.Vector3,
  velocityLengthSqr: number,
  t: number,
  origin: THREE.Vector3,
  velocity: THREE.Vector3,
  caster: SphereCaster,
) {
  const edge = pool.vecA.subVectors(vertexB, vertexA);
  const originToVertex = pool.vecB.subVectors(vertexA, origin);

  const edgeLengthSqr = edge.lengthSq();
  const edgeDotVelocity = edge.dot(velocity);
  const edgeDotOriginToVertex = edge.dot(originToVertex);

  const a = edgeLengthSqr * -velocityLengthSqr + edgeDotVelocity * edgeDotVelocity;
  const b = edgeLengthSqr * (2 * velocity.dot(originToVertex)) - 2 * edgeDotVelocity * edgeDotOriginToVertex;
  const c = edgeLengthSqr * (1 - originToVertex.lengthSq()) + edgeDotOriginToVertex * edgeDotOriginToVertex;

  const newT = getLowestRoot(a, b, c, t);

  if (newT !== null && newT < caster.t) {
    // Check if intersection is within the line segment.
    const f = (edgeDotVelocity * newT - edgeDotOriginToVertex) / edgeLengthSqr;

    if (f >= 0 && f <= 1) {
      const point = pool.vecC.copy(vertexA).addScaledVector(edge, f);
      caster.setCollision(newT, point);
      return newT;
    }
  }

  return t;
}

const debugTri = new ExtendedTriangle();

export class SphereCaster {
  public origin: THREE.Vector3;
  public radius: number;
  public distance: number;
  public direction: THREE.Vector3;
  public needsUpdate: boolean;

  private originSpherical: THREE.Vector3;
  private end: THREE.Vector3;
  private velocity: THREE.Vector3;
  private velocitySpherical: THREE.Vector3;
  private isCollided: boolean;
  private _t: number;
  private aabb: THREE.Box3;
  private triRef: ExtendedTriangle;
  private triSpherical: ExtendedTriangle;
  private triPlane: THREE.Plane;

  private location: THREE.Vector3;
  private impactPoint: THREE.Vector3;
  private impactNormal: THREE.Vector3;

  constructor(radius?: number, origin?: THREE.Vector3, direction?: THREE.Vector3, distance?: number) {
    this.radius = radius ?? 1;
    this.origin = origin ?? new THREE.Vector3();
    this.distance = distance ?? 0;
    this.direction = direction ?? new THREE.Vector3(0, 0, -1);
    this.needsUpdate = false;

    this.originSpherical = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.end = new THREE.Vector3();
    this.velocitySpherical = new THREE.Vector3();
    this.isCollided = false;
    this._t = 0;
    this.aabb = new THREE.Box3();
    this.triSpherical = new ExtendedTriangle();
    this.triRef = this.triSpherical; // It's just a ref, so we temporarlity ref triSpherical
    this.triPlane = new THREE.Plane();

    this.location = new THREE.Vector3();
    this.impactPoint = new THREE.Vector3();
    this.impactNormal = new THREE.Vector3();

    this.update();
  }

  private update() {
    if (!this.needsUpdate) return;

    this.originSpherical = this.originSpherical.copy(this.origin).divideScalar(this.radius);
    this.velocity = this.velocity.set(0, 0, 0).addScaledVector(this.direction, this.distance);
    this.end = this.end.copy(this.origin).add(this.velocity);
    this.velocitySpherical = this.velocitySpherical.copy(this.velocity).divideScalar(this.radius);
    this.aabb = this.aabb.setFromPoints([this.origin, this.end]);
    this.aabb.min.addScalar(-this.radius);
    this.aabb.max.addScalar(this.radius);

    this.needsUpdate = false;
  }

  get t() {
    return this._t;
  }

  set(radius: number, origin: THREE.Vector3, direction: THREE.Vector3, distance: number) {
    this.radius = radius;
    this.origin = origin;
    this.distance = distance;
    this.direction = direction;

    this.update();
  }

  setCollision(t: number, point: THREE.Vector3) {
    this.isCollided = true;

    if (t < this._t) {
      this._t = t;
      this.impactPoint.copy(point);
      this.triRef.getNormal(this.impactNormal);

      debugTri.copy(this.triRef);
    }
  }

  intersectMesh(mesh: THREE.Mesh) {
    if (this.needsUpdate) this.update();
    this.isCollided = false;
    this._t = 1;
    this.impactPoint.set(0, 0, 0);

    drafter.drawBox3(this.aabb);
    drafter.drawRay({ origin: this.origin, direction: this.direction, distance: this.distance });

    mesh.geometry.boundsTree?.shapecast({
      intersectsBounds: (bounds) => bounds.intersectsBox(this.aabb),
      intersectsTriangle: (triR3) => {
        // We assume everything is in unit spherical coordinates here.
        const { triSpherical: tri, velocitySpherical: velocity, originSpherical: origin } = this;

        this.triRef = triR3;

        // Convert the tri to unit spherical coordinates.
        tri.copy(triR3);
        tri.a.divideScalar(this.radius);
        tri.b.divideScalar(this.radius);
        tri.c.divideScalar(this.radius);

        tri.getPlane(this.triPlane);

        // We only check for front-facing triangles. Back-faces are ignored!
        if (!tri.isFrontFacing(this.direction)) return false;

        let t0, t1;
        let isEmbeddedInPlane = false;

        const signedDistanceToTriPlane = this.triPlane.distanceToPoint(origin);
        const normalDotVelocity = this.triPlane.normal.dot(velocity);

        if (Math.abs(normalDotVelocity) < 0.0001) {
          // Sphere is travelling parrallel to the plane:
          if (Math.abs(signedDistanceToTriPlane) >= 1) {
            // Sphere is not embedded in plane, No collision possible
            return false;
          } else {
            // Sphere is completely embedded in plane.
            // It intersects in the whole range [0..1]
            isEmbeddedInPlane = true;
            t0 = 0;
            t1 = 1;
          }
        } else {
          // t0 is when the sphere rests on the front side of the plane.
          // t1 is when the sphere rests on the back side of the plane.
          // Together they make the interval of intersection.
          t0 = (1 - signedDistanceToTriPlane) / normalDotVelocity;
          t1 = (-1 - signedDistanceToTriPlane) / normalDotVelocity;

          // Swap so t0 < t1.
          if (t0 > t1) {
            const tmp = t0;
            t0 = t1;
            t1 = tmp;
          }

          // Check that at least one result is within range:
          if (t0 > 1 || t1 < 0) {
            return false;
          }

          // Clamp so our interval of intersection is [0, 1].
          if (t0 < 0) t0 = 0;
          if (t1 < 0) t1 = 0;
          if (t0 > 1) t0 = 1;
          if (t1 > 1) t1 = 1;
        }

        // If the closest possible collision point is further away
        // than an already detected collision then there's no point
        // in testing further.
        if (t0 >= this._t) return false;

        // t0 and t1 now represent the range of the sphere movement
        // during which it intersects with the triangle plane.
        // Collisions cannot happen outside that range.

        drafter.drawWireTriangle(triR3.clone(), { color: 'blue', alwaysOnTop: true, opacity: 0.5 });

        if (!isEmbeddedInPlane) {
          // Check if the sphere intersection with the plane is inside the triangle.
          const planeIntersectionPoint = pool.vecA
            .subVectors(origin, this.triPlane.normal)
            .addScaledVector(velocity, t0);

          if (tri.containsPoint(planeIntersectionPoint)) {
            this.setCollision(t0, planeIntersectionPoint);

            // Collisions against the face will always be closer than vertex or edge collisions
            // so we can stop checking now.
            return false;
          }

          const velocityLengthSqr = velocity.lengthSq();
          let t = this._t;

          t = testVertex(tri.a, velocityLengthSqr, t, origin, velocity, this);
          t = testVertex(tri.b, velocityLengthSqr, t, origin, velocity, this);
          t = testVertex(tri.c, velocityLengthSqr, t, origin, velocity, this);

          t = testEdge(tri.a, tri.b, velocityLengthSqr, t, origin, velocity, this);
          t = testEdge(tri.b, tri.c, velocityLengthSqr, t, origin, velocity, this);
          testEdge(tri.c, tri.a, velocityLengthSqr, t, origin, velocity, this);
        }
      },
    });

    if (this.isCollided) {
      this.location.copy(this.origin).addScaledVector(this.velocity, this._t);
      this.impactPoint.multiplyScalar(this.radius);

      drafter.drawTriangle(debugTri.clone(), { color: 'red', opacity: 0.25, winZFight: true });
      drafter.drawPoint(this.impactPoint);
      drafter.drawPoint(this.location, { color: 'blue' });
      drafter.drawWireSphere({ center: this.location, radius: this.radius }, { color: 'blue', opacity: 0.5 });
    }
  }
}
