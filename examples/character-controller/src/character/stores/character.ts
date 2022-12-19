import { Capsule } from 'collider/geometry/capsule';
import * as THREE from 'three';

export class Character extends THREE.Object3D {
  public isCharacter: boolean;
  public boundingCapsule: Capsule;
  public boundingBox: THREE.Box3;

  constructor(radius: number, halfHeight: number) {
    super();
    this.type = 'Character';
    this.isCharacter = true;
    this.boundingCapsule = new Capsule(radius, halfHeight);
    this.boundingBox = new THREE.Box3();
  }
}
