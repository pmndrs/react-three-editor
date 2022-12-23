import { useUpdate } from '@react-three/fiber';
import { CharacterControllerContext } from 'character/contexts/character-controller-context';
import { useContext, useLayoutEffect } from 'react';
import { createModifier } from './use-modifiers';

export type SlidingProps = {
  gravity?: number;
  maxFallSpeed?: number;
};

export const DEFAULT_SLIDING_GRAVITY = -20;

export function Sliding({ gravity = DEFAULT_SLIDING_GRAVITY, maxFallSpeed = -30 }: SlidingProps) {
  const { addModifier, removeModifier, getIsSliding, getGroundAngle } = useContext(CharacterControllerContext);
  const modifier = createModifier('sliding');

  useLayoutEffect(() => {
    addModifier(modifier);
    return () => removeModifier(modifier);
  }, [addModifier, gravity, modifier, removeModifier]);

  useUpdate((_, delta) => {
    const isSliding = getIsSliding();
    const angle = getGroundAngle();

    if (isSliding) {
      modifier.value.y -= Math.max(angle * 0.2 * delta, maxFallSpeed);
    } else {
      modifier.value.y = 0;
    }
  });

  return null;
}
