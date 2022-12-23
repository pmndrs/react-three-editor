import { useThree, extend, Object3DNode, createPortal, Color, useUpdate } from '@react-three/fiber';
import { useState } from 'react';
import * as THREE from 'three';
import { LineGeometry, LineMaterial, Line2 } from 'three-stdlib';

extend({ Line2, LineGeometry, LineMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    lineGeometry: Object3DNode<LineGeometry, typeof LineGeometry>;
    lineMaterial: Object3DNode<LineMaterial, typeof LineMaterial>;
    line2: Object3DNode<Line2, typeof Line2>;
  }
}

type LineDebugProps = {
  line: THREE.Line3 | null;
  color?: Color;
};

export function LineDebug({ line, color = 'cyan' }: LineDebugProps) {
  const scene = useThree((state) => state.scene);
  const [geometry] = useState(() => new LineGeometry());

  useUpdate(() => {
    if (line) {
      geometry.setPositions([line.start.x, line.start.y, line.start.z, line.end.x, line.end.y, line.end.z]);
    }
  });

  return (
    <>
      {createPortal(
        line && (
          <line2 geometry={geometry}>
            <lineMaterial color={color} linewidth={0.002} depthTest={false} />
          </line2>
        ),
        scene,
      )}
    </>
  );
}
