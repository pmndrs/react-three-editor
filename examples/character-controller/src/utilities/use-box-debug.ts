import { useUpdate, useThree, Stages } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function useBoxDebug(box3: THREE.Box3 | null = null) {
  const boxRef = useRef<THREE.LineSegments>(null!);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    if (!box3) return;

    const indices = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]);
    const positions = new Float32Array(8 * 3);

    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 'yellow', toneMapped: false }));
    line.matrixAutoUpdate = false;
    scene.add(line);

    boxRef.current = line;

    return () => {
      scene.remove(line);
    };
  }, [box3, scene]);

  useUpdate(() => {
    if (!box3) return;

    const min = box3.min;
    const max = box3.max;

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
  }, Stages.Late);
}
