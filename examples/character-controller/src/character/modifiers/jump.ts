import { useUpdate } from '@react-three/fiber';
import { CharacterControllerContext } from 'character/contexts/character-controller-context';
import { useCallback, useContext, useLayoutEffect, useState } from 'react';
// import { GRAVITY } from './gravity';
import { createModifier } from './use-modifiers';

export type JumpProps = {
  jumpSpeed?: number;
  jump?: () => boolean;
  jumpDuration?: number;
  comebackAcceleration?: number;
  coyoteTime?: number;
};

export function Jump({
  jumpSpeed = 8,
  jump,
  jumpDuration = 300,
  // comebackAcceleration = GRAVITY * 2,
  coyoteTime = 0.2,
}: JumpProps) {
  const { addModifier, removeModifier, getDeltaVector, getIsGroundedMovement, fsm } =
    useContext(CharacterControllerContext);
  const modifier = createModifier('jump');
  const [store] = useState({
    isRising: false,
    jumpStartTime: 0,
    prevInput: false,
    inputReleased: true,
    groundedTime: 0,
  });

  useLayoutEffect(() => {
    addModifier(modifier);
    return () => removeModifier(modifier);
  }, [addModifier, modifier, removeModifier]);

  const performJump = useCallback(() => {
    fsm.send('FALL');
    store.isRising = true;
    store.jumpStartTime = performance.now();
    modifier.value.set(0, jumpSpeed, 0);
  }, [fsm, jumpSpeed, modifier.value, store]);

  useUpdate((_, delta) => {
    if (!jump) return;
    const jumpInput = jump();
    const deltaVector = getDeltaVector();
    const isGrounded = getIsGroundedMovement();
    if (store.prevInput && !jumpInput) store.inputReleased = true;

    if (isGrounded) {
      store.isRising = false;
      modifier.value.set(0, 0, 0);
      store.groundedTime = performance.now();
    }

    if (performance.now() - store.groundedTime <= coyoteTime) {
      if (jumpInput && isGrounded) {
        if (store.inputReleased) performJump();
        store.inputReleased = false;
      }
    }

    if (store.isRising && !jumpInput) store.isRising = false;

    if (store.isRising && performance.now() > store.jumpStartTime + jumpDuration) store.isRising = false;

    // if (!store.isRising && !isGrounded) modifier.value.y += comebackAcceleration * delta;

    if (deltaVector.normalize().y < -0.9) modifier.value.y = 0;

    store.prevInput = jumpInput;
  });

  return null;
}
