import { extend, ThreeElement, useUpdate } from '@react-three/fiber';
import { useState } from 'react';
import { Line2, LineGeometry, LineMaterial } from 'three-stdlib';
import * as THREE from 'three';

extend({ Line2, LineGeometry, LineMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    lineGeometry: ThreeElement<typeof LineGeometry>;
    lineMaterial: ThreeElement<typeof LineMaterial>;
    line2: ThreeElement<typeof Line2>;
  }
}

type Distance = number | React.MutableRefObject<number>;

type RayWireframeProps = {
  color?: string | number | THREE.Color | [r: number, g: number, b: number];
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  distance: Distance;
};

function updateGeo(
  lineGeo: LineGeometry,
  end: THREE.Vector3,
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  distance: Distance,
) {
  let _distance = 0;

  if (typeof distance === 'number') {
    _distance = distance;
  } else {
    _distance = distance.current;
  }

  end.copy(origin);
  end.addScaledVector(direction, _distance);

  return lineGeo.setPositions([origin.x, origin.y, origin.z, end.x, end.y, end.z]);
}

export function RayWireframe({ color = 'red', origin, direction, distance }: RayWireframeProps) {
  const [store] = useState(() => {
    const end = new THREE.Vector3();
    const lineGeo = new LineGeometry();
    updateGeo(lineGeo, end, origin, direction, distance);
    return { end, lineGeo };
  });

  useUpdate(() => {
    const { end, lineGeo } = store;
    updateGeo(lineGeo, end, origin, direction, distance);
  });

  return (
    <line2 geometry={store.lineGeo}>
      <lineMaterial attach="material" color={color} linewidth={0.002} />
    </line2>
  );
}
