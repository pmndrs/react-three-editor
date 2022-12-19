import { Color, createPortal, extend, Object3DNode, Stages, useThree, useUpdate } from '@react-three/fiber';
import { BoundingVolume, Capsule } from 'character/bounding-volume/use-bounding-volume';
import { MutableRefObject, useRef, useState } from 'react';
import * as THREE from 'three';
import { Line as LineThree } from 'three';
import { LineGeometry, LineMaterial, Line2 } from 'three-stdlib';

extend({ Line2, LineGeometry, LineMaterial, LineThree });

declare module '@react-three/fiber' {
  interface ThreeElements {
    lineGeometry: Object3DNode<LineGeometry, typeof LineGeometry>;
    lineMaterial: Object3DNode<LineMaterial, typeof LineMaterial>;
    line2: Object3DNode<Line2, typeof Line2>;
    lineThree: Object3DNode<LineThree, typeof LineThree>;
  }
}

type VolumeDebugProps = {
  bounding: BoundingVolume;
  showLine?: boolean;
  showBox?: boolean;
  showCollider?: boolean;
  showForce?: boolean;
};

function createCapsulePoints(radius = 1, length = 1, degrees = 30) {
  const points = [];

  // Left half circle
  for (let i = 0; i <= degrees; i++) {
    points.push(Math.cos(i * (Math.PI / degrees)) * radius, Math.sin(i * (Math.PI / degrees)) * radius + length / 2, 0);
  }

  // Right half circle
  for (let i = 0; i <= degrees; i++) {
    points.push(
      -Math.cos(i * (Math.PI / degrees)) * radius,
      -Math.sin(i * (Math.PI / degrees)) * radius - length / 2,
      0,
    );
  }

  // Closing point
  points.push(points[0], points[1], points[2]);

  return points;
}

function createBoxGeometry() {
  const indices = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]);
  const positions = new Float32Array(8 * 3);

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  return geometry;
}

function updateBox(box: THREE.Box3, boxRef: MutableRefObject<THREE.LineSegments>) {
  const min = box.min;
  const max = box.max;

  const position = boxRef.current.geometry.attributes.position;
  const array = position.array as number[];

  array[0] = max.x;
  array[1] = max.y;
  array[2] = max.z;
  array[3] = min.x;
  array[4] = max.y;
  array[5] = max.z;
  array[6] = min.x;
  array[7] = min.y;
  array[8] = max.z;
  array[9] = max.x;
  array[10] = min.y;
  array[11] = max.z;
  array[12] = max.x;
  array[13] = max.y;
  array[14] = min.z;
  array[15] = min.x;
  array[16] = max.y;
  array[17] = min.z;
  array[18] = min.x;
  array[19] = min.y;
  array[20] = min.z;
  array[21] = max.x;
  array[22] = min.y;
  array[23] = min.z;

  position.needsUpdate = true;

  boxRef.current.geometry.computeBoundingSphere();
}

function CapsuleLine({ capsule, color = 'yellow' }: { capsule: Capsule; color?: Color }) {
  return (
    <>
      <line2 geometry={new LineGeometry().setPositions(createCapsulePoints(capsule.radius, capsule.height))}>
        <lineMaterial attach="material" color={color} linewidth={0.002} />
      </line2>
      <line2
        rotation={[0, Math.PI / 2, 0]}
        geometry={new LineGeometry().setPositions(createCapsulePoints(capsule.radius, capsule.height))}>
        <lineMaterial color={color} linewidth={0.002} />
      </line2>
      <line2
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, capsule.height / 2, 0]}
        geometry={new LineGeometry().setPositions(createCapsulePoints(capsule.radius, 0))}>
        <lineMaterial color={color} linewidth={0.002} />
      </line2>
      <line2
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, -capsule.height / 2, 0]}
        geometry={new LineGeometry().setPositions(createCapsulePoints(capsule.radius, 0))}>
        <lineMaterial color={color} linewidth={0.002} />
      </line2>
    </>
  );
}

export function VolumeDebug({
  bounding,
  showLine = false,
  showBox = false,
  showCollider = true,
  showForce = false,
}: VolumeDebugProps) {
  const colliderRef = useRef<THREE.Group>(null!);
  const forceRef = useRef<THREE.Group>(null!);
  const boxRef = useRef<THREE.LineSegments>(null!);
  const [vec] = useState(() => new THREE.Vector3());
  const [forceCapsule] = useState<Capsule>({ ...bounding.boundingCapsule });
  const scene = useThree((state) => state.scene);

  useUpdate(() => {
    if (showForce) {
      bounding.boundingBox.getCenter(vec);
      forceRef.current.position.copy(vec);
    }

    bounding.updateMatrixWorld();
    bounding.computeBoundingVolume();
    bounding.boundingBox.getCenter(vec);
    colliderRef.current.position.copy(vec);

    if (showBox) updateBox(bounding.boundingBox, boxRef);
  }, Stages.Late);

  return (
    <>
      {createPortal(
        <>
          {/* Force visualization */}
          {showForce && (
            <group ref={forceRef}>
              <CapsuleLine capsule={forceCapsule} color="cyan" />
            </group>
          )}

          <group ref={colliderRef}>
            {/* Capsule collider visualization */}
            {showCollider && <CapsuleLine capsule={bounding.boundingCapsule} />}

            {/* Collision line visualization */}
            {showLine && (
              <lineThree
                geometry={new THREE.BufferGeometry().setFromPoints([
                  bounding.boundingCapsule.line.start,
                  bounding.boundingCapsule.line.end,
                ])}>
                <lineBasicMaterial color={'cyan'} depthTest={false} />
              </lineThree>
            )}
          </group>

          {/* Bounding box visualization */}
          {showBox && (
            <lineSegments ref={boxRef} geometry={createBoxGeometry()}>
              <lineBasicMaterial color={'red'} />
            </lineSegments>
          )}
        </>,
        scene,
      )}
    </>
  );
}
