import { SmoothDamp } from '@gsimone/smoothdamp';
import { Stages, useUpdate } from '@react-three/fiber';
import { useCameraController } from 'camera/stores/camera-store';
import { CharacterController, CharacterControllerProps, TransformFn } from 'character/character-controller-classic';
import { Falling, FallingProps } from 'character/modifiers/falling';
import { Gravity, GravityProps } from 'character/modifiers/gravity';
import { Jump, JumpProps } from 'character/modifiers/jump';
import { Walking, WalkingProps, DEFAULT_WALK_SPEED } from 'character/modifiers/walking';
import { useCharacterController } from 'character/stores/character-store';
import { useInputs } from 'input/input-controller';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { PlayerRig } from './player-rig';
import { Sliding } from 'character/modifiers/sliding';

type PlayerControllerProps = CharacterControllerProps &
  Omit<GravityProps, 'alwaysOn'> &
  Omit<JumpProps, 'jump'> &
  Omit<WalkingProps, 'movement' | 'speed'> &
  Omit<FallingProps, 'movement' | 'speed'> & {
    gravityAlwaysOn?: boolean;
    walkSpeed?: number;
    airControl?: number;
    rotateTime?: number;
    position?: THREE.Vector3 | [x: number, y: number, z: number];
  };

export function PlayerController({
  children,
  walkSpeed = DEFAULT_WALK_SPEED,
  airControl = 0.5,
  rotateTime = 0.1,
  id,
  ...props
}: PlayerControllerProps) {
  const [store] = useState(() => ({
    forward: new THREE.Vector3(),
    right: new THREE.Vector3(),
    walk: new THREE.Vector3(),
    move: new THREE.Vector2(),
    smoothDamp: new SmoothDamp(rotateTime, 100),
    targetAngle: 0,
    currentAngle: 0,
    forwardVec: new THREE.Vector3(0, 1, 0),
    position: new THREE.Vector3(),
    prevPosition: new THREE.Vector3(),
  }));

  const character = useCharacterController((state) => state.characters.get(id));
  const setTarget = useCameraController((state) => state.setTarget);
  const inputs = useInputs();

  useEffect(() => setTarget(character as THREE.Object3D), [character, setTarget]);

  useEffect(() => {
    if (!character) return;

    if (props.position) {
      if (Array.isArray(props.position)) store.position.set(...props.position);
      if (props.position instanceof THREE.Vector3) store.position.copy(props.position);
      if (typeof props.position === 'number') store.position.set(props.position, props.position, props.position);

      if (store.position.equals(store.prevPosition)) return;

      character.position.copy(store.position);
      character.updateMatrix();
    } else {
      character.position.set(0, 0, 0);
      character.updateMatrix();
    }
    store.prevPosition.copy(character.position);
  }, [character, props.position, store]);

  const transform: TransformFn = (character, dt) => {
    store.smoothDamp.smoothTime = rotateTime;

    if (store.walk.length() !== 0) {
      store.targetAngle = Math.atan2(store.walk.x, store.walk.z);
    } else {
      store.targetAngle = store.currentAngle;
    }

    const angleDelta = store.targetAngle - store.currentAngle;
    // If the angle delta is greater than PI radians, we need to rotate the other way.
    // This stops the character from rotating the long way around.
    if (Math.abs(angleDelta) > Math.PI) {
      store.targetAngle = store.targetAngle - Math.sign(angleDelta) * Math.PI * 2;
    }

    store.currentAngle = store.smoothDamp.get(store.currentAngle, store.targetAngle, dt);
    // Make sure our character's angle never exceeds 2PI radians.
    if (store.currentAngle > Math.PI) store.currentAngle -= Math.PI * 2;
    if (store.currentAngle < -Math.PI) store.currentAngle += Math.PI * 2;

    character.setRotationFromAxisAngle(store.forwardVec, store.currentAngle);

    // Reset player position if we fall too far down.

    if (character.position.y < -10) {
      if (props.position) {
        if (Array.isArray(props.position)) character.position.set(...props.position);
        if (props.position instanceof THREE.Vector3) character.position.copy(props.position);
        if (typeof props.position === 'number') character.position.set(props.position, props.position, props.position);
      } else {
        character.position.set(0, 0, 0);
      }
    }
  };

  // Update the player's movement vector based on camera direction.
  useUpdate((state) => {
    const { move: moveInput } = inputs;
    const { forward, right, walk, move } = store;

    move.set(moveInput.x, moveInput.y);
    const magnitude = Math.min(move.length(), 1);
    move.normalize();

    forward.set(0, 0, -1).applyQuaternion(state.camera.quaternion);
    forward.normalize().multiplyScalar(move.y);
    forward.y = 0;

    right.set(1, 0, 0).applyQuaternion(state.camera.quaternion);
    right.normalize().multiplyScalar(move.x);
    right.y = 0;

    walk.addVectors(forward, right).multiplyScalar(magnitude);
  }, Stages.Early);

  return (
    <CharacterController
      id={id}
      debug={props.debug}
      capsule={props.capsule}
      slopeLimit={props.slopeLimit}
      groundOffset={props.groundOffset}
      nearGround={props.nearGround}
      transform={transform}>
      {children}
      <Walking movement={() => store.walk} speed={walkSpeed} />
      <Falling movement={() => store.walk} speed={walkSpeed * airControl} />
      <Jump jump={() => inputs.jump} jumpSpeed={props.jumpSpeed} />
      <Gravity gravity={props.gravity} maxFallSpeed={props.maxFallSpeed} />
      <Sliding />
      <PlayerRig />
    </CharacterController>
  );
}
