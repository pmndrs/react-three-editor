/**
 * This file has been borrowed from the 'three-noise' package by Faraz Shaikh (@CantBeFaraz):
 * https://github.com/FarazzShaikh/three-noise/blob/master/build/three-noise.module.js
 *
 * because at the time of writing there are a couple of issues with said package:
 * https://github.com/FarazzShaikh/three-noise/issues
 */
// @ts-nocheck

import { Vector2, Vector3 } from "three";

var definitions_perlin =
  '#define GLSLIFY 1\n// From https://github.com/hughsk/glsl-noise/blob/master/periodic/2d.glsl\n\n//\n// GLSL textureless classic 2D noise "cnoise",\n// with an RSL-style periodic variant "pnoise".\n// Author:  Stefan Gustavson (stefan.gustavson@liu.se)\n// Version: 2011-08-22\n//\n// Many thanks to Ian McEwan of Ashima Arts for the\n// ideas for permutation and gradient selection.\n//\n// Copyright (c) 2011 Stefan Gustavson. All rights reserved.\n// Distributed under the MIT license. See LICENSE file.\n// https://github.com/ashima/webgl-noise\n//\n\nvec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\n\nvec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }\n\nvec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\n\nvec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\n\nfloat map(float value, float min1, float max1, float min2, float max2) {\n  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);\n}\n\n// Classic Perlin noise, periodic variant\nfloat perlin(vec2 P) {\n\n  vec2 rep = vec2(255.0, 255.0);\n\n  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);\n  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);\n  Pi = mod(Pi, rep.xyxy); // To create noise with explicit period\n  Pi = mod289(Pi);        // To avoid truncation effects in permutation\n  vec4 ix = Pi.xzxz;\n  vec4 iy = Pi.yyww;\n  vec4 fx = Pf.xzxz;\n  vec4 fy = Pf.yyww;\n\n  vec4 i = permute(permute(ix) + iy);\n\n  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;\n  vec4 gy = abs(gx) - 0.5;\n  vec4 tx = floor(gx + 0.5);\n  gx = gx - tx;\n\n  vec2 g00 = vec2(gx.x, gy.x);\n  vec2 g10 = vec2(gx.y, gy.y);\n  vec2 g01 = vec2(gx.z, gy.z);\n  vec2 g11 = vec2(gx.w, gy.w);\n\n  vec4 norm = taylorInvSqrt(\n      vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));\n  g00 *= norm.x;\n  g01 *= norm.y;\n  g10 *= norm.z;\n  g11 *= norm.w;\n\n  float n00 = dot(g00, vec2(fx.x, fy.x));\n  float n10 = dot(g10, vec2(fx.y, fy.y));\n  float n01 = dot(g01, vec2(fx.z, fy.z));\n  float n11 = dot(g11, vec2(fx.w, fy.w));\n\n  vec2 fade_xy = fade(Pf.xy);\n  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);\n  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);\n  return map(2.3 * n_xy, -1.0, 1.0, 0.0, 1.0);\n}\n\nfloat fbm(vec2 pos, vec4 props) {\n  float persistance = props.x;\n  float lacunarity = props.y;\n  float redistribution = props.z;\n  int octaves = int(props.w);\n\n  float result = 0.0;\n  float amplitude = 1.0;\n  float frequency = 1.0;\n  float maximum = amplitude;\n\n  for (int i = 0; i < 2; i++) {\n\n    vec2 p = pos.xy * frequency;\n\n    float noiseVal = perlin(p);\n    result += noiseVal * amplitude;\n\n    frequency *= lacunarity;\n    amplitude *= persistance;\n    maximum += amplitude;\n  }\n\n  float redistributed = pow(result, redistribution);\n  return redistributed / maximum;\n}\n'; // eslint-disable-line

var p = [
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30,
  69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94,
  252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136,
  171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229,
  122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25,
  63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116,
  188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202,
  38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28,
  42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43,
  172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218,
  246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145,
  235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115,
  121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141,
  128, 195, 78, 66, 215, 61, 156, 180
];

/**
 * An implimentation of Perlin Noise by Ken Perlin.
 */
class Perlin {
  /**
   *
   * @param {number} seed Seed Value for PRNG.
   */
  constructor(seed) {
    const _gradientVecs = [
      // 2D Vecs
      new Vector3(1, 1, 0),
      new Vector3(-1, 1, 0),
      new Vector3(1, -1, 0),
      new Vector3(-1, -1, 0),
      // + 3D Vecs
      new Vector3(1, 0, 1),
      new Vector3(-1, 0, 1),
      new Vector3(1, 0, -1),
      new Vector3(-1, 0, -1),
      new Vector3(0, 1, 1),
      new Vector3(0, -1, 1),
      new Vector3(0, 1, -1),
      new Vector3(0, -1, -1)
    ];

    var perm = new Array(512);
    var gradP = new Array(512);

    if (!seed) seed = 1;
    seed *= 65536;

    seed = Math.floor(seed);
    if (seed < 256) {
      seed |= seed << 8;
    }

    for (var i = 0; i < 256; i++) {
      var v;
      if (i & 1) {
        v = p[i] ^ (seed & 255);
      } else {
        v = p[i] ^ ((seed >> 8) & 255);
      }

      perm[i] = perm[i + 256] = v;
      gradP[i] = gradP[i + 256] = _gradientVecs[v % 12];
    }

    this._seed = seed;

    this._offsetMatrix = [
      new Vector3(0, 0, 0),
      new Vector3(0, 0, 1),
      new Vector3(0, 1, 0),
      new Vector3(0, 1, 1),
      new Vector3(1, 0, 0),
      new Vector3(1, 0, 1),
      new Vector3(1, 1, 0),
      new Vector3(1, 1, 1)
    ];

    /**
     * GLSL Shader Chunk for 2D Perlin Noise. Can be used with
     * three-CustomShaderMaterial.
     * See: <a href="https://github.com/FarazzShaikh/THREE-CustomShaderMaterial">three-CustomShaderMaterial</a>
     */
    this.shaderChunk = {
      defines: "",
      header: definitions_perlin,
      main: "",
      uniforms: [{ three_noise_seed: this._seed }]
    };

    this.perm = perm;
    this.gradP = gradP;
  }

  _fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  _lerp(a, b, t) {
    return (1 - t) * a + t * b;
  }

  _gradient(posInCell) {
    if (posInCell instanceof Vector3) {
      return posInCell.x + this.perm[posInCell.y + this.perm[posInCell.z]];
    } else {
      return posInCell.x + this.perm[posInCell.y];
    }
  }

  /**
   * Maps a number from one range to another.
   * @param {number} x       Input Number
   * @param {number} in_min  Current range minimum
   * @param {number} in_max  Current range maximum
   * @param {number} out_min New range minimum
   * @param {number} out_max New range maximum
   * @returns {number} Input Mapped to range [out_min, out_max]
   */
  static map(x, in_min, in_max, out_min, out_max) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }

  /**
   * Samples 2D Perlin Nosie at given coordinates.
   * @param {Vector2 | Vector3} input Coordincates to sample at
   * @returns {number} Value of Perlin Noise at that coordinate.
   */
  get2(input) {
    if (input.z !== undefined) input = new Vector2(input.x, input.y);

    const cell = new Vector2(Math.floor(input.x), Math.floor(input.y));
    input.sub(cell);

    cell.x &= 255;
    cell.y &= 255;

    const gradiantDot = [];
    for (let i = 0; i < 4; i++) {
      const s3 = this._offsetMatrix[i * 2];
      const s = new Vector2(s3.x, s3.y);

      const grad3 = this.gradP[this._gradient(new Vector2().addVectors(cell, s))];
      const grad2 = new Vector2(grad3.x, grad3.y);
      const dist2 = new Vector2().subVectors(input, s);

      gradiantDot.push(grad2.dot(dist2));
    }

    const u = this._fade(input.x);
    const v = this._fade(input.y);

    const value = this._lerp(
      this._lerp(gradiantDot[0], gradiantDot[2], u),
      this._lerp(gradiantDot[1], gradiantDot[3], u),
      v
    );

    return value;
  }

  /**
   * Samples 3D Perlin Nosie at given coordinates.
   * @param {Vector}3 input Coordincates to sample at
   * @returns {number} Value of Perlin Noise at that coordinate.
   */
  get3(input) {
    if (input.z === undefined) throw "Input to Perlin::get3() must be of type Vector3";

    const cell = new Vector3(
      Math.floor(input.x),
      Math.floor(input.y),
      Math.floor(input.z)
    );
    input.sub(cell);

    cell.x &= 255;
    cell.y &= 255;
    cell.z &= 255;

    const gradiantDot = [];
    for (let i = 0; i < 8; i++) {
      const s = this._offsetMatrix[i];

      const grad3 = this.gradP[this._gradient(new Vector3().addVectors(cell, s))];
      const dist2 = new Vector3().subVectors(input, s);

      gradiantDot.push(grad3.dot(dist2));
    }

    const u = this._fade(input.x);
    const v = this._fade(input.y);
    const w = this._fade(input.z);

    const value = this._lerp(
      this._lerp(
        this._lerp(gradiantDot[0], gradiantDot[4], u),
        this._lerp(gradiantDot[1], gradiantDot[5], u),
        w
      ),
      this._lerp(
        this._lerp(gradiantDot[2], gradiantDot[6], u),
        this._lerp(gradiantDot[3], gradiantDot[7], u),
        w
      ),
      v
    );

    return value;
  }
}

/**
 * This class is an implimentaiton of a Fractal Brownian Motion
 * function using Perlin Nosie.
 */
class FBM {
  /**
   * Create an instance of the FBM class.
   * Use this instance to generate fBm noise.
   *
   * @param {Object} options Options for fBm generaiton.
   * @param {number} options.seed Seed for Perlin Noise
   * @param {number} options.scale What distance to view the noisemap
   * @param {number} options.persistance How much each octave contributes to the overall shape
   * @param {number} options.lacunarity How much detail is added or removed at each octave
   * @param {number} options.octaves Levels of detail you want you perlin noise to have
   * @param {number} options.redistribution Level of flatness within the valleys
   */
  constructor(options) {
    const { seed, scale, persistance, lacunarity, octaves, redistribution } = options;
    this._noise = new Perlin(seed);
    this._scale = scale || 1;
    this._persistance = persistance || 0.5;
    this._lacunarity = lacunarity || 2;
    this._octaves = octaves || 6;
    this._redistribution = redistribution || 1;
  }

  /**
   * Sample 2D Perlin Noise with fBm at given
   * coordinates. The function will use <code>Perlin_get2</code> or <code>Perlin_get3</code>
   * depending on the input vector's type.
   *
   * @param {(Vector2 | Vector3)} input Coordinates to sample noise at.
   * @returns {number} Normalized noise in the range [0, 1]
   */
  get2(input) {
    let result = 0;
    let amplitude = 1;
    let frequency = 1;
    let max = amplitude;

    let noiseFunction = this._noise.get2.bind(this._noise);

    for (let i = 0; i < this._octaves; i++) {
      const position = new Vector2(
        input.x * this._scale * frequency,
        input.y * this._scale * frequency
      );

      const noiseVal = noiseFunction(position);
      result += noiseVal * amplitude;

      frequency *= this._lacunarity;
      amplitude *= this._persistance;
      max += amplitude;
    }

    const redistributed = Math.pow(result, this._redistribution);
    return redistributed / max;
  }

  /**
   * Sample 3D Perlin Noise with fBm at given
   * coordinates. The function will use <code>Perlin_get2</code> or <code>Perlin_get3</code>
   * depending on the input vector's type.
   *
   * @param {Vector3} input Coordinates to sample noise at.
   * @returns {number} Normalized noise in the range [0, 1]
   */
  get3(input) {
    let result = 0;
    let amplitude = 1;
    let frequency = 1;
    let max = amplitude;

    let noiseFunction = this._noise.get3.bind(this._noise);

    for (let i = 0; i < this._octaves; i++) {
      const position = new Vector3(
        input.x * this._scale * frequency,
        input.y * this._scale * frequency,
        input.z * this._scale * frequency
      );

      const noiseVal = noiseFunction(position);
      result += noiseVal * amplitude;

      frequency *= this._lacunarity;
      amplitude *= this._persistance;
      max += amplitude;
    }

    const redistributed = Math.pow(result, this._redistribution);
    return redistributed / max;
  }
}

export { FBM, Perlin };
