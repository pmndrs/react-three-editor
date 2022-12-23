import { getDebug } from 'debug/react/debug';
import * as THREE from 'three';
import { ExtendedTriangle } from 'three-mesh-bvh';
// @ts-ignore
import { traceSphereTriangle, TraceInfo } from '.';

const DEBUG = getDebug();

const pool = { vecA: new THREE.Vector3(), vecB: new THREE.Vector3(), vecC: new THREE.Vector3() };

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
  private t: number;
  private impactPoint: THREE.Vector3;
  private impactNormal: THREE.Vector3;
  private aabb: THREE.Box3;
  private triSpherical: ExtendedTriangle;
  private triPlane: THREE.Plane;
  private nearestDistance: number;
  private location: THREE.Vector3;
  private traceInfo: TraceInfo;

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
    this.t = 0;
    this.impactPoint = new THREE.Vector3();
    this.impactNormal = new THREE.Vector3();
    this.aabb = new THREE.Box3();
    this.triSpherical = new ExtendedTriangle();
    this.triPlane = new THREE.Plane();
    this.nearestDistance = 0;
    this.location = new THREE.Vector3();

    this.traceInfo = new TraceInfo();

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

  set(radius: number, origin: THREE.Vector3, direction: THREE.Vector3, distance: number) {
    this.radius = radius;
    this.origin = origin;
    this.distance = distance;
    this.direction = direction;

    this.update();
  }

  intersectMesh(mesh: THREE.Mesh) {
    if (this.needsUpdate) this.update();

    this.traceInfo.resetTrace(
      [this.origin.x, this.origin.y, this.origin.z],
      [this.end.x, this.end.y, this.end.z],
      this.radius,
    );

    DEBUG.drawBox3(this.aabb);
    DEBUG.drawRay({ origin: this.origin, direction: this.direction, distance: this.distance });

    mesh.geometry.boundsTree?.shapecast({
      intersectsBounds: (bounds) => bounds.intersectsBox(this.aabb),
      intersectsTriangle: (tri) => {
        traceSphereTriangle(
          [tri.a.x, tri.a.y, tri.a.z],
          [tri.b.x, tri.b.y, tri.b.z],
          [tri.c.x, tri.c.y, tri.c.z],
          this.traceInfo,
        );
      },
    });

    if (this.traceInfo.collision) {
      const temp: [number, number, number] = [0, 0, 0];
      this.traceInfo.getTraceEndpoint(temp);
      this.location.set(...temp);
      this.impactPoint.set(
        this.traceInfo.intersectPoint[0],
        this.traceInfo.intersectPoint[1],
        this.traceInfo.intersectPoint[2],
      );

      DEBUG.drawPoint(this.impactPoint);
      DEBUG.drawPoint(this.location, { color: 'purple' });
      DEBUG.drawWireSphere({ center: this.location, radius: this.radius }, { color: 'purple', opacity: 0.5 });
    }
  }
}
