import { useUpdate } from '@react-three/fiber';
import { CharacterControllerContext } from 'character/contexts/character-controller-context';
import { useContext, useLayoutEffect } from 'react';
import { createModifier } from './use-modifiers';

export function AirCollision() {
  const { addModifier, removeModifier, getDeltaVector, getVelocity, getIsGroundedMovement } =
    useContext(CharacterControllerContext);
  const modifier = createModifier('air-collision');

  useLayoutEffect(() => {
    addModifier(modifier);
    return () => removeModifier(modifier);
  }, [addModifier, removeModifier, modifier]);

  useUpdate(() => {
    const isGrounded = getIsGroundedMovement();
    // Reflect velocity if character collides while airborne.
    if (!isGrounded) {
      const velocity = getVelocity();
      const deltaVector = getDeltaVector();

      deltaVector.normalize();
      deltaVector.multiplyScalar(-deltaVector.dot(velocity));
      modifier.value.copy(deltaVector);
    } else {
      modifier.value.set(0, 0, 0);
    }
  });

  return null;
}
