import { useUpdate } from '@react-three/fiber';
import { CharacterControllerContext } from 'character/contexts/character-controller-context';
import { useContext, useLayoutEffect } from 'react';
import { createModifier } from './use-modifiers';

export type GravityProps = {
  gravity?: number;
  maxFallSpeed?: number;
};

export const DEFAULT_GRAVITY = -9.81;
const GROUNDED_GRAVITY = 0;

export function Gravity({ gravity = DEFAULT_GRAVITY, maxFallSpeed = -30 }: GravityProps) {
  const { addModifier, removeModifier, getIsGroundedMovement } = useContext(CharacterControllerContext);
  const modifier = createModifier('gravity');

  useLayoutEffect(() => {
    addModifier(modifier);
    return () => removeModifier(modifier);
  }, [addModifier, gravity, modifier, removeModifier]);

  useUpdate((_, delta) => {
    const isGrounded = getIsGroundedMovement();

    if (isGrounded) {
      modifier.value.y = GROUNDED_GRAVITY;
    } else {
      modifier.value.y = Math.max(modifier.value.y + gravity * delta, maxFallSpeed);
    }
  });

  return null;
}
