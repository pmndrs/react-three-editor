import { createPortal, useThree, useUpdate } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { CapsuleCastParams } from '../capsule-cast-old';
import { CapsuleWireframe } from '../../geometry/debug/capsule-wireframe';
import { RayWireframe } from './ray-wireframe';
import * as THREE from 'three';
import { Sphere } from '@react-three/drei';
import { HitInfo } from '../objects/hit-info';

type CapsuleCastDebugProps = CapsuleCastParams & { hitInfoRef: React.MutableRefObject<HitInfo | null> };

export function CapsuleCastDebug({
  radius,
  halfHeight,
  transform,
  direction,
  maxDistance,
  hitInfoRef,
}: CapsuleCastDebugProps) {
  const capOriginRef = useRef<THREE.Group>(null!);
  const capHitRef = useRef<THREE.Group>(null!);
  const capEndRef = useRef<THREE.Group>(null!);
  const pointRef = useRef<THREE.Mesh>(null!);
  const raySplitRef = useRef<THREE.Group>(null!);

  const scene = useThree((state) => state.scene);
  const [isInit, setIsInit] = useState(false);
  const [store] = useState({ hitDistance: 0, splitOrigin: new THREE.Vector3(), splitDistance: 0 });
  const hitDistanceRef = useRef(store.hitDistance);
  const splitDistanceRef = useRef(store.splitDistance);

  useUpdate(() => {
    const capOrigin = capOriginRef.current;
    const capEnd = capEndRef.current;
    const capHit = capHitRef.current;
    const point = pointRef.current;
    const raySplit = raySplitRef.current;
    const hitInfo = hitInfoRef.current;

    capOrigin.matrix.copy(transform);
    capOrigin.matrix.decompose(capOrigin.position, capOrigin.quaternion, capOrigin.scale);

    capEnd.position.copy(capOrigin.position);
    capEnd.position.addScaledVector(direction, maxDistance);
    capEnd.updateMatrix();

    if (hitInfo) {
      capEnd.visible = true;
      point.visible = true;
      if (raySplit) raySplit.visible = true;

      point.position.copy(hitInfo.point);

      store.hitDistance = hitInfo.distance;
      hitDistanceRef.current = store.hitDistance;

      store.splitDistance = maxDistance - store.hitDistance;
      splitDistanceRef.current = store.splitDistance;

      store.splitOrigin.copy(capOriginRef.current.position);
      store.splitOrigin.addScaledVector(direction, store.hitDistance);

      capHit.position.copy(hitInfo.location);
      capHit.updateMatrix();
    } else {
      capEnd.visible = false;
      point.visible = false;
      if (raySplit) raySplit.visible = false;

      store.hitDistance = maxDistance;
    }

    setIsInit(true);
  });

  return (
    <>
      {createPortal(
        <>
          <CapsuleWireframe ref={capOriginRef} radius={radius} halfHeight={halfHeight} matrixAutoUpdate={false} />
          <CapsuleWireframe ref={capHitRef} radius={radius} halfHeight={halfHeight} matrixAutoUpdate={false} />
          <CapsuleWireframe
            ref={capEndRef}
            color="green"
            radius={radius}
            halfHeight={halfHeight}
            matrixAutoUpdate={false}
          />

          {isInit && (
            <>
              {console.log(capOriginRef.current.position, direction, hitDistanceRef)}
              <RayWireframe origin={capOriginRef.current.position} direction={direction} distance={hitDistanceRef} />
              <group ref={raySplitRef}>
                <RayWireframe
                  color="green"
                  origin={store.splitOrigin}
                  direction={direction}
                  distance={splitDistanceRef}
                />
              </group>
            </>
          )}
          {hitInfoRef && (
            <>
              {/* @ts-ignore */}
              <Sphere ref={pointRef} args={[0.05]} position={hitInfoRef.current?.point}>
                <meshBasicMaterial color="red" />
              </Sphere>
            </>
          )}
        </>,
        scene,
      )}
    </>
  );
}
