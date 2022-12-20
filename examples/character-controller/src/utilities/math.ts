import * as THREE from 'three';
import { SmoothDamp } from '@gsimone/smoothdamp';
import { Unity } from './unity';

const DEFAULT_TOLERANCE = 1e-5;

export function quatDamp(current: THREE.Quaternion, target: THREE.Quaternion, lambda: number, delta: number) {
  const angleTo = current.angleTo(target);

  if (angleTo > 0) {
    const t = THREE.MathUtils.damp(0, angleTo, lambda, delta);
    current = current.slerp(target, t);
  }
}

export function quatSmoothDamp(current: THREE.Quaternion, target: THREE.Quaternion, smoothTime: number, delta: number) {
  const angleTo = current.angleTo(target);
  const smoothDamp = new SmoothDamp(smoothTime / 10, 50);
  console.log(angleTo);

  if (angleTo > 0) {
    const t = smoothDamp.get(0, angleTo, delta);
    current = current.slerp(target, t);
  }
}

function projectOnVector(a: THREE.Vector4, b: THREE.Vector4, target: THREE.Vector4) {
  const denominator = a.lengthSq();

  if (denominator === 0) return b.set(0, 0, 0, 0);

  const scalar = a.dot(b) / denominator;

  return target.copy(a).multiplyScalar(scalar);
}

// https://gist.github.com/maxattack/4c7b4de00f5c1b95a33b#file-quaternionutil-cs-L38
// Dirty conversion that may not work right.
const deriv = new THREE.Vector4();
export function quatSmoothDamp2(
  current: THREE.Quaternion,
  target: THREE.Quaternion,
  smoothTime: number,
  delta: number,
) {
  if (delta < Number.EPSILON) return current;
  // account for double-cover
  const dot = current.dot(target);
  const multi = dot > 0 ? 1 : -1;
  target.x *= multi;
  target.y *= multi;
  target.z *= multi;
  target.w *= multi;
  // smooth damp (nlerp approx)
  const result = new THREE.Vector4(
    Unity.smoothDamp(current.x, target.x, deriv.x, smoothTime, Infinity, delta),
    Unity.smoothDamp(current.y, target.y, deriv.y, smoothTime, Infinity, delta),
    Unity.smoothDamp(current.z, target.z, deriv.z, smoothTime, Infinity, delta),
    Unity.smoothDamp(current.w, target.w, deriv.w, smoothTime, Infinity, delta),
  ).normalize();

  // ensure deriv is tangent
  // const derivError = Vector4.Project(new Vector4(deriv.x, deriv.y, deriv.z, deriv.w), result);
  const derivError = new THREE.Vector4();
  projectOnVector(new THREE.Vector4(deriv.x, deriv.y, deriv.z, deriv.w), result, derivError);
  deriv.x -= derivError.x;
  deriv.y -= derivError.y;
  deriv.z -= derivError.z;
  deriv.w -= derivError.w;

  return new THREE.Quaternion(result.x, result.y, result.z, result.w);
}

export function testSlope(normal: THREE.Vector3, upDirection: THREE.Vector3, slopeLimit: number) {
  const dp = normal.dot(upDirection);
  return dp >= 0.0 && dp < slopeLimit;
}

export function toFixedNumber(num: number, digits: number, base = 10) {
  const pow = Math.pow(base, digits);
  return Math.round(num * pow) / pow;
}

export function notEqualToZero(num: number) {
  return Math.abs(num) > Number.EPSILON;
}

export function equalToZero(num: number) {
  return Math.abs(num) < Number.EPSILON;
}

export function isEqualTolerance(x: number, y: number, tolerance?: number) {
  return Math.abs(x - y) < (tolerance ?? DEFAULT_TOLERANCE);
}
