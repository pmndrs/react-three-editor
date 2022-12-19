import React, { useCallback, useEffect, useRef, useState } from 'react';
// import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useCollider } from 'collider/stores/collider-store';
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
  MeshBVH,
  MeshBVHVisualizer,
  StaticGeometryGenerator,
} from 'three-mesh-bvh';
import * as THREE from 'three';
// @ts-ignore // Using our own SimplifyModifier to fix a bug.
// import { SimplifyModifier } from './SimplifyModifier';
import { useUpdate } from '@react-three/fiber';

type ColliderProps = {
  children: React.ReactNode;
  debug?: boolean | { collider?: boolean; bvh?: boolean };
  // simplify?: number;
  autoUpdate?: boolean;
};

export function Collider({
  children,
  debug = { collider: false, bvh: false },
  // simplify,
  autoUpdate = false,
}: ColliderProps) {
  const ref = useRef<THREE.Group>(null!);
  const [collider, setCollider] = useCollider((state) => [state.collider, state.setCollider]);
  const [bvhVisualizer, setBvhVisualizer] = useState<MeshBVHVisualizer | undefined>(undefined);
  const [store] = useState({
    init: true,
    boxMap: {} as Record<string, THREE.Box3>,
    prevBoxMap: {} as Record<string, THREE.Box3>,
    matrixMap: {} as Record<string, THREE.Matrix4>,
    prevMatrixMap: {} as Record<string, THREE.Matrix4>,
    generator: null as unknown as StaticGeometryGenerator,
  });
  const _debug = debug === true ? { collider: true, bvh: false } : debug;

  const updateMaps = useCallback(
    (object: THREE.Object3D) => {
      if (object instanceof THREE.Group) {
        store.matrixMap[object.uuid] = object.matrix.clone();
      }
      if (object instanceof THREE.Mesh && object.geometry) {
        if (object.geometry.boundingBox === null) object.geometry.computeBoundingBox();
        store.boxMap[object.uuid] = object.geometry.boundingBox;
        store.matrixMap[object.uuid] = object.matrix.clone();
      }
    },
    [store],
  );

  const buildColliderGeometry = useCallback(() => {
    ref.current.updateMatrixWorld();

    ref.current.traverse((c) => {
      if (autoUpdate) updateMaps(c);
    });

    if (autoUpdate) {
      store.prevBoxMap = { ...store.boxMap };
      store.prevMatrixMap = { ...store.matrixMap };
    }

    store.generator = new StaticGeometryGenerator(ref.current);
    const geometry = store.generator.generate();

    // Simplify the geometry for better performance.
    // if (simplify) {
    //   const modifier = new SimplifyModifier();
    //   const count = Math.floor(merged.attributes.position.count * simplify);
    //   merged = modifier.modify(merged, count);
    // }

    return geometry;
  }, [autoUpdate, store, updateMaps]);

  const rebuildBVH = useCallback(() => {
    const geometry = buildColliderGeometry();
    collider?.geometry.dispose();
    collider?.geometry.copy(geometry);
    collider?.geometry.computeBoundsTree();
  }, [buildColliderGeometry, collider?.geometry]);

  const refitBVH = useCallback(() => {
    if (!collider) return;
    store.generator.generate(collider.geometry);
    collider.geometry.boundsTree?.refit();
  }, [collider, store.generator]);

  // Initialization of BVH collider.
  useEffect(() => {
    if (!ref.current || !store.init) return;

    const geometry = buildColliderGeometry();
    geometry.boundsTree = new MeshBVH(geometry);

    const collider = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        wireframe: true,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    );
    collider.raycast = acceleratedRaycast;
    collider.geometry.computeBoundsTree = computeBoundsTree;
    collider.geometry.disposeBoundsTree = disposeBoundsTree;

    setCollider(collider);

    store.init = false;
  }, [buildColliderGeometry, setCollider, store]);

  // Initialization of BVH visualizer.
  useEffect(() => {
    if (collider) {
      const visualizer = new MeshBVHVisualizer(collider, 10);
      setBvhVisualizer(visualizer);
    }
  }, [collider]);

  // Dispose of the BVH if we unmount.
  useEffect(() => {
    return () => {
      if (!collider) return;
      collider?.geometry.dispose();
      const material = collider?.material as THREE.Material;
      material.dispose();
    };
  }, [collider]);

  useUpdate(() => {
    if (!collider || !autoUpdate) return;

    store.boxMap = {};
    ref.current.traverse((c) => {
      if (c instanceof THREE.Group) {
        store.matrixMap[c.uuid] = c.matrix.clone();
      }
      if (c instanceof THREE.Mesh && c.geometry) {
        if (c.geometry.boundingBox === null) c.geometry.computeBoundingBox();
        store.boxMap[c.uuid] = c.geometry.boundingBox;
        store.matrixMap[c.uuid] = c.matrix.clone();
      }
    });

    if (Object.keys(store.boxMap).length !== Object.keys(store.prevBoxMap).length) {
      rebuildBVH();
      store.prevBoxMap = { ...store.boxMap };
      return;
    }

    for (const uuid in store.boxMap) {
      const current = store.boxMap[uuid];
      const prev = store.prevBoxMap[uuid];

      if (current.equals(prev)) continue;

      rebuildBVH();
      store.prevBoxMap = { ...store.boxMap };
      break;
    }

    for (const uuid in store.matrixMap) {
      const current = store.matrixMap[uuid];
      const prev = store.prevMatrixMap[uuid];

      if (current.equals(prev)) continue;

      refitBVH();
      store.prevMatrixMap = { ...store.matrixMap };
      break;
    }

    store.prevMatrixMap = { ...store.matrixMap };
    store.prevBoxMap = { ...store.boxMap };
  });

  return (
    <>
      <group ref={ref}>{children}</group>
      {_debug && collider && <primitive visible={_debug.collider} object={collider} />}
      {_debug && bvhVisualizer && <primitive visible={_debug.bvh} object={bvhVisualizer} />}
    </>
  );
}
