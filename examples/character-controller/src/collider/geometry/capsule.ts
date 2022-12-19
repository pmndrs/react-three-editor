import * as THREE from 'three';

// Capsules are shaped as the union of a cylinder of length 2 * halfHeight and with the given
// radius centered at the origin and extending along the x axis, and two hemispherical ends.

export class Capsule {
  public radius: number;
  public halfHeight: number;

  constructor(radius?: number, halfHeight?: number) {
    this.radius = radius ?? 0;
    this.halfHeight = halfHeight ?? 0;
  }

  set(radius: number, halfHeight: number) {
    this.radius = radius;
    this.halfHeight = halfHeight;
  }

  isValid() {
    if (this.radius <= 0) return false;
    if (this.halfHeight <= 0) return false;
    return true;
  }

  toSegment(line?: THREE.Line3) {
    line = line ?? new THREE.Line3();
    const halfSegment = this.halfHeight - this.radius;
    line.start.set(0, halfSegment, 0);
    line.end.set(0, -halfSegment, 0);
    return line;
  }
}
