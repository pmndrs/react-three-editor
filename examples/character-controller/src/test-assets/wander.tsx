import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import { usePlayer } from 'player/player-store';

type GLTFResult = GLTF & {
  nodes: {
    Body: THREE.SkinnedMesh;
    Hips: THREE.Bone;
  };
  materials: {
    ['combined_material_9554669693.001']: THREE.MeshStandardMaterial;
  };
};

// type ActionName = 'Dance 1' | 'Pose 1' | 'Walking';
// type GLTFActions = Record<ActionName, THREE.AnimationAction>;

export function Wander(props: JSX.IntrinsicElements['group']) {
  const group = useRef<THREE.Group>(null!);
  const { nodes, materials, animations } = useGLTF('/wander.glb') as GLTFResult;
  const { actions } = useAnimations<any>(animations, group);

  const setActions = usePlayer((state) => state.setActions);

  useEffect(() => {
    setActions(actions);
  }, [setActions, actions]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene" position={[0, -0.32, 0]}>
        <group name="Armature">
          <primitive object={nodes.Hips} />
          <skinnedMesh
            name="Body"
            geometry={nodes.Body.geometry}
            material={materials['combined_material_9554669693.001']}
            skeleton={nodes.Body.skeleton}
            receiveShadow
            castShadow
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload('/wander.glb');
