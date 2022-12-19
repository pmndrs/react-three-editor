import { useUpdate, useThree, Stages } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function useLineDebug(line3: THREE.Line3 | null = null) {
  const lineRef = useRef<THREE.Line>(null!);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    if (!line3) return;
    const points = [];
    points.push(line3.start);
    points.push(line3.end);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 'red', depthTest: false }));
    scene.add(line);
    lineRef.current = line;

    return () => {
      scene.remove(line);
    };
  }, [line3, scene]);

  useUpdate(() => {
    if (lineRef.current && line3) {
      const points = [];
      points.push(line3.start);
      points.push(line3.end);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      lineRef.current.geometry = geometry;
    }
  }, Stages.Late);
}
