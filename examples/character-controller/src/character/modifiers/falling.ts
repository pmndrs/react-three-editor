import { useUpdate } from '@react-three/fiber';
import { CharacterControllerContext } from 'character/contexts/character-controller-context';
import { useContext, useLayoutEffect, useState } from 'react';
import * as THREE from 'three';
import { createModifier } from './use-modifiers';
import { DEFAULT_WALK_SPEED } from './walking';

export type FallingProps = {
  speed?: number;
  movement?: () => THREE.Vector3;
  boostVelocityThreshold?: number;
  boostVelocity?: number;
};

export function Falling({
  speed = DEFAULT_WALK_SPEED * 0.5,
  movement,
  boostVelocity = 2,
  boostVelocityThreshold = 1,
}: FallingProps) {
  const { addModifier, removeModifier, getIsFalling, getVelocity } = useContext(CharacterControllerContext);
  const modifier = createModifier('falling');
  const [store] = useState({
    velocity: new THREE.Vector3(),
    magnitude: 0,
    initialVelocity: new THREE.Vector3(),
    initialMagnitude: 0,
  });

  useLayoutEffect(() => {
    addModifier(modifier);
    return () => removeModifier(modifier);
  }, [addModifier, modifier, removeModifier]);

  useUpdate(() => {
    if (!movement) return;
    const input = movement();
    const isFalling = getIsFalling();

    if (isFalling) {
      const scaledInput = input.multiplyScalar(speed);
      modifier.value.copy(scaledInput);
    } else {
      modifier.value.set(0, 0, 0);
    }

    // if (isFalling) {
    //   if (input.length() > 0) {
    //     if (store.initialVelocity.length() < boostVelocityThreshold) {
    //       store.magnitude = store.initialMagnitude + 1 * boostVelocity;
    //     } else {
    //       store.magnitude = store.initialMagnitude;
    //     }
    //     const scaledInput = input.multiplyScalar(speed);
    //     store.velocity.copy(store.initialVelocity).add(scaledInput);
    //     store.velocity.clampLength(0, store.magnitude);
    //     modifier.value.copy(store.velocity);
    //   }
    // } else {
    //   modifier.value.set(0, 0, 0);
    //   store.initialVelocity.copy(getVelocity());
    //   store.initialVelocity.y = 0;
    //   store.initialMagnitude = store.initialVelocity.length();
    // }
  });

  return null;
}
