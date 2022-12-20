export class HitInfo {
  public collider: THREE.Object3D;
  public location: THREE.Vector3;
  public normal: THREE.Vector3;
  public distance: number;
  public impactPoint: THREE.Vector3;
  public impactNormal: THREE.Vector3;

  constructor(args: {
    collider: THREE.Object3D;
    normal: THREE.Vector3;
    distance: number;
    location: THREE.Vector3;
    impactPoint: THREE.Vector3;
    impactNormal: THREE.Vector3;
  }) {
    this.collider = args.collider;
    this.location = args.location;
    this.normal = args.normal;
    this.distance = args.distance;
    this.impactPoint = args.impactPoint;
    this.impactNormal = args.impactNormal;
  }
}
