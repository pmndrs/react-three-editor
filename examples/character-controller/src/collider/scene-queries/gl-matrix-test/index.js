/*
 * Copyright (c) 2012 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

// Much of this was taken from the paper "Improved Collision detection and Response"
// by Kasper Fauerby
// http://www.peroxide.dk/papers/collision/collision.pdf

// Most of the changes were just to get it to work nicely with Javascript
// and some minor optimizations. There's probably even more optimizations
// to be made.
import { vec3, mat4 } from 'gl-matrix';
import TraceInfo from './TraceInfo';

var ta = vec3.create();
var tb = vec3.create();
var tc = vec3.create();

var pab = vec3.create();
var pac = vec3.create();
var norm = vec3.create();

var v = vec3.create();
var edge = vec3.create();

var planeIntersect = vec3.create();

var pt0 = vec3.create();
var pt1 = vec3.create();
var pt2 = vec3.create();

// TODO: Look into a faster method.
function pointInTriangle(p, t0, t1, t2) {
  vec3.subtract(pt0, t0, p);
  vec3.subtract(pt1, t1, p);
  vec3.subtract(pt2, t2, p);

  vec3.normalize(pt0, pt0);
  vec3.normalize(pt1, pt1);
  vec3.normalize(pt2, pt2);

  var a = vec3.dot(pt0, pt1);
  var b = vec3.dot(pt1, pt2);
  var c = vec3.dot(pt2, pt0);

  var angle = Math.acos(a) + Math.acos(b) + Math.acos(c);

  // If the point is on the triangle all the interior angles should add up to 360 deg.
  var collision = Math.abs(angle - 2 * Math.PI) < 0.01;
  return collision;
}

// TODO: Don't like the duality of returning a null or float, probably doesn't optimize nicely
function getLowestRoot(a, b, c, maxR) {
  var det = b * b - 4.0 * a * c;
  if (det < 0) {
    return null;
  }

  var sqrtDet = Math.sqrt(det);
  var r1 = (-b - sqrtDet) / (2.0 * a);
  var r2 = (-b + sqrtDet) / (2.0 * a);

  if (r1 > r2) {
    var tmp = r2;
    r2 = r1;
    r1 = tmp;
  }

  if (r1 > 0 && r1 < maxR) {
    return r1;
  }

  if (r2 > 0 && r2 < maxR) {
    return r2;
  }

  return null;
}

function testVertex(p, velSqrLen, t, start, vel, trace) {
  vec3.subtract(v, start, p);
  var b = 2.0 * vec3.dot(vel, v);
  var c = vec3.squaredLength(v) - 1.0;
  var newT = getLowestRoot(velSqrLen, b, c, t);

  if (newT !== null) {
    trace.setCollision(newT, p);
    return newT;
  }
  return t;
}

function testEdge(pa, pb, velSqrLen, t, start, vel, trace) {
  vec3.subtract(edge, pb, pa);
  vec3.subtract(v, pa, start);

  var edgeSqrLen = vec3.squaredLength(edge);
  var edgeDotVel = vec3.dot(edge, vel);
  var edgeDotSphereVert = vec3.dot(edge, v);

  var a = edgeSqrLen * -velSqrLen + edgeDotVel * edgeDotVel;
  var b = edgeSqrLen * (2.0 * vec3.dot(vel, v)) - 2.0 * edgeDotVel * edgeDotSphereVert;
  var c = edgeSqrLen * (1.0 - vec3.squaredLength(v)) + edgeDotSphereVert * edgeDotSphereVert;

  // Check for intersection against infinite line
  var newT = getLowestRoot(a, b, c, t);
  if (newT !== null && newT < trace.t) {
    // Check if intersection against the line segment:
    var f = (edgeDotVel * newT - edgeDotSphereVert) / edgeSqrLen;
    if (f >= 0.0 && f <= 1.0) {
      vec3.scale(v, edge, f);
      vec3.add(v, pa, v);
      trace.setCollision(newT, v);
      return newT;
    }
  }
  return t;
}

/**
 * @param {vec3} a First triangle vertex
 * @param {vec3} b Second triangle vertex
 * @param {vec3} c Third triangled vertex
 * @param {TraceInfo} trace TraceInfo containing the sphere path to trace
 */
function traceSphereTriangle(a, b, c, trace) {
  trace.tmpTri = [a, b, c];
  var invRadius = trace.invRadius;
  var vel = trace.scaledVel;
  var start = trace.scaledStart;

  // Scale the triangle points so that we're colliding against a unit-radius sphere.
  vec3.scale(ta, a, invRadius);
  vec3.scale(tb, b, invRadius);
  vec3.scale(tc, c, invRadius);

  // Calculate triangle normal.
  // This may be better to do as a pre-process
  vec3.subtract(pab, tb, ta);
  vec3.subtract(pac, tc, ta);
  vec3.cross(norm, pab, pac);
  vec3.normalize(norm, norm);
  trace.tmpTriNorm = norm;
  var planeD = -(norm[0] * ta[0] + norm[1] * ta[1] + norm[2] * ta[2]);

  // Colliding against the backface of the triangle
  if (vec3.dot(norm, trace.normVel) >= 0) {
    // Two choices at this point:

    // 1) Negate the normal so that it always points towards the start point
    // This feels kludgy, but I'm not sure if there's a better alternative
    /*vec3.negate(norm, norm);
       planeD = -planeD;*/

    // 2) Or allow it to pass through
    return;
  }

  // Get interval of plane intersection:
  var t0, t1;
  var embedded = false;

  // Calculate the signed distance from sphere
  // position to triangle plane
  var distToPlane = vec3.dot(start, norm) + planeD;

  // cache this as we’re going to use it a few times below:
  var normDotVel = vec3.dot(norm, vel);

  if (normDotVel === 0.0) {
    // Sphere is travelling parrallel to the plane:
    if (Math.abs(distToPlane) >= 1.0) {
      // Sphere is not embedded in plane, No collision possible
      return;
    } else {
      // Sphere is completely embedded in plane.
      // It intersects in the whole range [0..1]
      embedded = true;
      t0 = 0.0;
      t1 = 1.0;
    }
  } else {
    // Calculate intersection interval:
    t0 = (-1.0 - distToPlane) / normDotVel;
    t1 = (1.0 - distToPlane) / normDotVel;
    // Swap so t0 < t1
    if (t0 > t1) {
      var temp = t1;
      t1 = t0;
      t0 = temp;
    }
    // Check that at least one result is within range:
    if (t0 > 1.0 || t1 < 0.0) {
      // No collision possible
      return;
    }
    // Clamp to [0,1]
    if (t0 < 0.0) t0 = 0.0;
    if (t1 < 0.0) t1 = 0.0;
    if (t0 > 1.0) t0 = 1.0;
    if (t1 > 1.0) t1 = 1.0;
  }

  // If the closest possible collision point is further away
  // than an already detected collision then there's no point
  // in testing further.
  if (t0 >= trace.t) {
    return;
  }

  // t0 and t1 now represent the range of the sphere movement
  // during which it intersects with the triangle plane.
  // Collisions cannot happen outside that range.

  // Check for collision againt the triangle face:
  if (!embedded) {
    // Calculate the intersection point with the plane
    vec3.subtract(planeIntersect, start, norm);
    vec3.scale(v, vel, t0);
    vec3.add(planeIntersect, v, planeIntersect);

    // Is that point inside the triangle?
    if (pointInTriangle(planeIntersect, ta, tb, tc)) {
      trace.setCollision(t0, planeIntersect);
      // Collisions against the face will always be closer than vertex or edge collisions
      // so we can stop checking now.
      return;
    }
  }

  var velSqrLen = vec3.squaredLength(vel);
  var t = trace.t;

  // Check for collision againt the triangle vertices:
  t = testVertex(ta, velSqrLen, t, start, vel, trace);
  t = testVertex(tb, velSqrLen, t, start, vel, trace);
  t = testVertex(tc, velSqrLen, t, start, vel, trace);

  // Check for collision against the triangle edges:
  t = testEdge(ta, tb, velSqrLen, t, start, vel, trace);
  t = testEdge(tb, tc, velSqrLen, t, start, vel, trace);
  testEdge(tc, ta, velSqrLen, t, start, vel, trace);
}

export { TraceInfo, traceSphereTriangle };

// SAMPLE USAGE:
/*
   var traceInfo = new TraceInfo();
   var startPoint = [-10, 0, 0];
   var endPoint = [10, 0, 0];
   var radius = 0.5;
   // Tracing a 0.5 radius sphere moving from X:-10 to X:10
   traceInfo.resetTrace(startPoint, endPoint, radius);
   // You really need to do a good broadphase triangle set reduction (ie: octree)
   // to reduce the number of triangles you're colliding against. This is not a cheap
   // test!
   for(i in sceneTriangles) {
   tri = sceneTriangles[i];
   traceSphereTriangle(tri.verts[0], tri.verts[1], tri.verts[2], traceInfo);
   }
   if(traceInfo.collision) {
   // This will get the position of the sphere when it collided with the closest triangle
   traceInfo.getTraceEndpoint(endPoint);

   // This is the point on the triangle where the sphere collided.
   traceInfo.intersectPoint;
   // You can use the above two values to generate an appropriate collision response.
   }
 */
