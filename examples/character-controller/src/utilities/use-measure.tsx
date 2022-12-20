import { useEffect, useState } from 'react';
import * as THREE from 'three';

export type MeasureHandler = (size: THREE.Vector3, box: THREE.Box3) => void;
type MeasureOptions = { precise?: boolean };

export function useMeasure(
  ref: React.MutableRefObject<THREE.Object3D>,
  callback: MeasureHandler,
  options?: MeasureOptions,
) {
  const [size] = useState(() => new THREE.Vector3(0, 0, 0));
  const [box] = useState(() => new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)));

  useEffect(() => {
    if (!ref.current) return;
    box.setFromObject(ref.current, options?.precise);
    box.getSize(size);
    callback(size, box);
  }, [box, callback, options?.precise, ref, size]);
}
