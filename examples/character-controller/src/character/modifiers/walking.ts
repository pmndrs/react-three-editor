import { useUpdate } from '@react-three/fiber';
import { CharacterControllerContext } from 'character/contexts/character-controller-context';
import { raycast } from 'collider/scene-queries/raycast';
import { useContext, useLayoutEffect, useState } from 'react';
import * as THREE from 'three';
import { createModifier } from './use-modifiers';

export const DEFAULT_WALK_SPEED = 5;
const DEFAULT_MAX_ANGLE = 65;

export type WalkingProps = {
  speed?: number;
  movement?: () => THREE.Vector3;
  adjustToSlope?: boolean;
};

export function Walking({ speed = DEFAULT_WALK_SPEED, movement, adjustToSlope = true }: WalkingProps) {
  const { addModifier, removeModifier, getIsWalking, getGroundNormal, getGroundAngle, getCharacter, getSlopeLimit } =
    useContext(CharacterControllerContext);
  const modifier = createModifier('walking');

  const [pool] = useState({ vecA: new THREE.Vector3(), vecB: new THREE.Vector3() });
  const [store] = useState({
    upVec: new THREE.Vector3(0, 1, 0),
    slopeRotation: new THREE.Quaternion(),
    adjustedVelocity: new THREE.Vector3(),
    input: new THREE.Vector3(),
  });

  useLayoutEffect(() => {
    addModifier(modifier);
    return () => removeModifier(modifier);
  }, [addModifier, modifier, removeModifier]);

  function calculateSlope(normal: THREE.Vector3) {
    const radians = store.upVec.angleTo(normal);
    return THREE.MathUtils.radToDeg(radians);
  }

  const adjustVelocityToSlope = (velocity: THREE.Vector3) => {
    const { slopeRotation, upVec, adjustedVelocity } = store;

    const groundNormal = getGroundNormal();
    const groundAngle = getGroundAngle();
    const character = getCharacter();
    const slopeLimit = getSlopeLimit();

    const rayHeightFromGround = 0.2;
    const rayCalculatedHeight = character.position.y - character.boundingCapsule.halfHeight + rayHeightFromGround;
    const rayOrigin = pool.vecA.set(character.position.x, rayCalculatedHeight, character.position.z);
    const rayDirection = pool.vecB.copy(velocity).normalize();

    const footHit = raycast(rayOrigin, rayDirection, 0.75);

    if (groundAngle < 5) {
      if (footHit && calculateSlope(footHit.impactNormal) > slopeLimit) {
        adjustedVelocity.copy(velocity).setY(-5);
        return adjustedVelocity;
      }
    } else {
      slopeRotation.setFromUnitVectors(upVec, groundNormal);
      adjustedVelocity.copy(velocity).applyQuaternion(slopeRotation);

      const relativeSlopeAngle = calculateSlope(adjustedVelocity) - 90;
      const temp = pool.vecA.copy(adjustedVelocity).multiplyScalar(relativeSlopeAngle / 100);
      adjustedVelocity.add(temp);

      if (footHit && calculateSlope(footHit.impactNormal) > slopeLimit) {
        adjustedVelocity.copy(velocity).setY(-5);
      }

      if (groundAngle < DEFAULT_MAX_ANGLE) {
        return adjustedVelocity;
      }
    }

    return velocity;
  };

  useUpdate(() => {
    if (!movement) return;
    const { input } = store;

    input.copy(movement());
    const isWalking = getIsWalking();

    if (isWalking && input.length() > 0) {
      const velocity = input.multiplyScalar(speed);
      if (adjustToSlope) velocity.copy(adjustVelocityToSlope(velocity));
      modifier.value.copy(velocity);
    } else {
      modifier.value.set(0, 0, 0);
    }
  });

  return null;
}
