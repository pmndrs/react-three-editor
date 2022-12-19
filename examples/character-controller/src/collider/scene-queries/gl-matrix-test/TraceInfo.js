import {vec3 } from 'gl-matrix'

export default function TraceInfo() {
  this.start = vec3.create();
  this.end = vec3.create();
  this.scaledStart = vec3.create();
  this.radius = 0;
  this.invRadius = 0;
  this.vel = vec3.create();
  this.scaledVel = vec3.create();
  this.velLength = 0;
  this.normVel = vec3.create();
  this.collision = false;
  this.t = 0;
  this.intersectPoint = vec3.create();
  this.tmp = vec3.create();
  this.tmpTri = [];
  this.intersectTri = [];

  this.tmpTriNorm = [];
  this.intersectTriNorm = [];
};

TraceInfo.prototype.resetTrace = function(start, end, radius) {
  this.invRadius = 1/radius;
  this.radius = radius;

  vec3.copy(this.start, start);
  vec3.copy(this.end, end);
  vec3.subtract(this.vel, end, start);
  vec3.normalize(this.normVel, this.vel);

  vec3.scale(this.scaledStart, start, this.invRadius);
  vec3.scale(this.scaledVel, this.vel, this.invRadius);

  this.velLength = vec3.length(this.vel);

  this.collision = false;
  this.t = 1.0;
};

TraceInfo.prototype.setCollision = function(t, point) {
  this.collision = true;
  this.intersectTri = this.tmpTri.slice(0);
  this.intersectTriNorm = this.tmpTriNorm.slice(0);
  if(t < this.t) {
    this.t = t;
    vec3.scale(this.intersectPoint, point, this.radius);
  }
};

TraceInfo.prototype.getTraceEndpoint = function(end) {
  vec3.scale(this.tmp, this.vel, this.t);
  vec3.add(end, this.start, this.tmp);
  return end;
};

TraceInfo.prototype.getTraceDistance = function() {
  vec3.scale(this.tmp, this.vel, this.t);
  return vec3.length(this.tmp);
};
