import { Stages, useUpdate } from '@react-three/fiber';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useCharacterController } from './stores/character-store';
import { useModifiers } from './modifiers/use-modifiers';
import { CharacterControllerContext } from './contexts/character-controller-context';
import { useInterpret } from '@xstate/react';
import { movementMachine } from './machines/movement-machine';
import { Capsule } from 'collider/geometry/capsule';
import { CapsuleWireframe } from 'collider/geometry/debug/capsule-wireframe';
import { Character } from './stores/character';
import { computeCapsulePenetration, PenetrationInfo } from 'collider/scene-queries/compute-capsule-penetration';
import { sphereCast } from 'collider/scene-queries/sphere-cast';
import { capsuleCastMTD } from 'collider/scene-queries/capsule-cast-mtd';
import { capsuleCast } from 'collider/scene-queries/capsule-cast';
import { isEqualTolerance } from 'utilities/math';

export type CapsuleConfig = { radius: number; height: number; center?: THREE.Vector3 };

export type HitInfo = {
  collider: THREE.Object3D;
  normal: THREE.Vector3;
  distance: number;
  location: THREE.Vector3;
  impactPoint: THREE.Vector3;
  impactNormal: THREE.Vector3;
};

export type MTD = {
  distance: number;
  direction: THREE.Vector3;
};

export type CapsuleCastFn = (
  radius: number,
  height: number,
  transform: THREE.Matrix4,
  direction: THREE.Vector3,
  maxDistance: number,
) => HitInfo | null;

export type OverlapCapsuleFn = (radius: number, height: number, transform: THREE.Matrix4) => THREE.Mesh[];

export type RaycastFn = (origin: THREE.Vector3, direction: THREE.Vector3, maxDistance: number) => HitInfo | null;

export type TransformFn = (character: Character, dt: number) => void;

export type ComputePenetrationFn = (
  colliderA: Capsule,
  transformA: THREE.Matrix4,
  colliderB: THREE.BufferGeometry,
  transformB: THREE.Matrix4,
) => MTD | null;

export type CharacterControllerProps = {
  id: string;
  children: React.ReactNode;
  debug?: boolean;
  capsule: CapsuleConfig;
  slopeLimit?: number;
  groundOffset?: number;
  nearGround?: number | false;
  transform?: TransformFn;
};

const TOLERANCE = 1e-5;
const STEPS = 5;

export function CharacterController({
  id,
  children,
  debug = false,
  capsule,
  transform,
  groundOffset = 0.05,
  nearGround = 1,
  slopeLimit = 47,
}: CharacterControllerProps) {
  const meshRef = useRef<THREE.Group>(null!);
  const [addCharacter, removeCharacter] = useCharacterController((state) => [
    state.addCharacter,
    state.removeCharacter,
  ]);

  const capsuleDebugRef = useRef<THREE.Group>(null!);

  const [pool] = useState({ vecA: new THREE.Vector3(), vecB: new THREE.Vector3() });
  const [store] = useState({
    depenetrateVector: new THREE.Vector3(),
    depenetrateVectorRaw: new THREE.Vector3(),
    isGrounded: false,
    isGroundedMovement: false,
    isFalling: false,
    isSliding: false,
    isNearGround: false,
    groundNormal: new THREE.Vector3(),
    groundAngle: 0,
    // Character store
    character: new Character(capsule.radius, capsule.height / 2),
    velocity: new THREE.Vector3(),
    movement: new THREE.Vector3(),
    maxDistance: 0,
    direction: new THREE.Vector3(),
    collision: false,
    penInfo: null as PenetrationInfo | null,
    // FSM store
    isModeReady: true,
    timer: 0,
  });

  // Get movement modifiers.
  const { modifiers, addModifier, removeModifier } = useModifiers();

  // Get fininte state machine.
  // TODO: I think there is a delay switching states when done in the callback.
  // I should investigate at some point.
  const fsm = useInterpret(
    movementMachine,
    {
      actions: {
        onFall: () => {
          clearTimeout(store.timer);
          store.isModeReady = false;
          store.timer = setTimeout(() => (store.isModeReady = true), 100);
        },
        onWalk: () => {
          clearTimeout(store.timer);
          store.isModeReady = false;
          store.timer = setTimeout(() => (store.isModeReady = true), 100);
        },
      },
    },
    (state) => {
      store.isGroundedMovement = state.matches('walking');
      store.isFalling = state.matches('falling');
    },
  );

  // Create character game object on init.
  useLayoutEffect(() => {
    addCharacter(id, store.character);
    return () => {
      removeCharacter(id);
    };
  }, [id, removeCharacter, addCharacter, capsule, store]);

  useLayoutEffect(() => {
    store.character.boundingCapsule.set(capsule.radius, capsule.height / 2);
  }, [capsule, store]);

  const calculateSlope = useCallback(
    function calculateSlope(normal: THREE.Vector3) {
      const upVec = pool.vecA.set(0, 1, 0);
      const radians = upVec.angleTo(normal);
      return THREE.MathUtils.radToDeg(radians);
    },
    [pool],
  );

  const updateGroundedState = useCallback(
    function updateGroundedState() {
      store.character.updateMatrixWorld();
      const { boundingCapsule: capsule, matrix } = store.character;

      store.isNearGround = false;
      store.isSliding = false;
      store.isGrounded = false;
      store.groundNormal.set(0, 0, 0);

      const smallRadius = capsule.radius * 0.9;
      const capsuleFoot = pool.vecB.copy(store.character.position);
      capsuleFoot.y -= capsule.halfHeight - smallRadius;
      const sphereTravelDistance = capsule.halfHeight - smallRadius + groundOffset;

      // Set isGrounded true if our depenetration vector y is larger than a quarter of movement y.
      // Some notes. This works well over all, but has a weakness when passing from a slope to level ground.
      // It'll flag false then true as the transition occurs.
      // store.isGrounded = store.depenetrateVectorRaw.y > Math.abs(dt * store.velocity.y * 0.25);

      // console.log(test);

      const groundHit = sphereCast(
        smallRadius,
        store.character.position,
        pool.vecA.set(0, -1, 0),
        sphereTravelDistance,
      );

      if (groundHit) store.groundNormal.copy(groundHit.impactNormal);
      else if (store.penInfo) store.groundNormal.copy(store.penInfo.normal);

      store.groundAngle = calculateSlope(store.groundNormal);
      store.isGrounded = !!groundHit;

      if (store.isGrounded && store.groundAngle > slopeLimit && !(store.groundAngle > 85 || store.groundAngle === 0)) {
        store.isSliding = true;
      }

      if (store.movement.y <= 0) {
        const capHit = capsuleCast(capsule.radius, capsule.halfHeight, matrix, pool.vecA.set(0, -1, 0), 0.2);

        if (capHit) {
          const deltaVector = pool.vecA;
          deltaVector.subVectors(capHit.location, store.character.position);

          // Only snap to ground if we are above nearly flat terrain.
          // It's a bit of a workaround but it works for now.
          if (deltaVector.length() > TOLERANCE && store.groundAngle <= 10) {
            store.character.position.copy(capHit.location);
          }
        }
      }

      // console.log(store.isGrounded);

      // // This is a capsule cast and not sphere cast so that the closest tri normal is consistent.
      // const groundHit = capsuleCast(
      //   capsule.radius / 2.8,
      //   capsule.halfHeight,
      //   matrix,
      //   pool.vecA.set(0, -1, 0),
      //   groundOffset,
      // );
      // // const groundHit = sphereCast(smallRadius, capsuleFoot, pool.vecA.set(0, -1, 0), groundOffset);

      // if (groundHit) store.groundNormal.copy(groundHit.impactNormal);
      // else if (store.penInfo) store.groundNormal.copy(store.penInfo.normal);
      // else store.groundNormal.set(0, 0, 0);

      // const angle = calculateSlope(store.groundNormal);

      // if (!store.isGrounded) {
      //   console.log(
      //     store.isGrounded,
      //     store.depenetrateVectorRaw.y,
      //     Math.abs(dt * store.movement.y * 0.25),
      //     dt * store.movement.y,
      //   );
      //   console.log(store.depenetrateVectorRaw);
      //   console.log('angle: ', angle);
      // }

      // // We do a small and then big ground test to be sure if we are walking on a steep slope
      // // or hovering over a drop.
      // if (!groundHit) {
      //   // const bigGroundHit = sphereCast(smallRadius, capsuleFoot, pool.vecA.set(0, -1, 0), bigGroundOffset);
      //   const bigGroundHit = capsuleCast(
      //     capsule.radius / 2.8,
      //     capsule.halfHeight,
      //     matrix,
      //     pool.vecA.set(0, -1, 0),
      //     bigGroundOffset,
      //   );

      //   if (bigGroundHit && isEqualTolerance(calculateSlope(bigGroundHit.impactNormal), angle) && angle !== 90) {
      //     store.isGrounded = true;
      //   } else if (bigGroundHit && calculateSlope(bigGroundHit.impactNormal) === 0 && angle === 90) {
      //     // noop for stairs. TODO rewrite the fuck outta this.
      //   } else {
      //     store.isGrounded = false;
      //   }
      // }

      // if (store.isGrounded && angle > slopeLimit && !(angle === 90 || angle === 0)) {
      //   store.isSliding = true;
      // }

      if (nearGround && store.movement.y <= 0) {
        const nearGroundHit = sphereCast(smallRadius, capsuleFoot, pool.vecA.set(0, -1, 0), nearGround);
        if (nearGroundHit) store.isNearGround = true;
      }
    },
    [store, pool, groundOffset, calculateSlope, slopeLimit, nearGround],
  );

  const updateMovementMode = () => {
    // Set character movement state. We have a cooldown to prevent false positives.
    if (store.isModeReady) {
      if (store.isGrounded) fsm.send('WALK');
      if (!store.isGrounded) fsm.send('FALL');
    }
  };

  const calculateMovement = (dt: number) => {
    store.velocity.set(0, 0, 0);
    store.movement.set(0, 0, 0);

    for (const modifier of modifiers) {
      store.velocity.add(modifier.value);
    }

    // Movement is the local space vector provided by velocity for a given dt.
    store.movement.addScaledVector(store.velocity, dt);
    store.maxDistance = store.movement.length();
    store.direction.copy(store.movement).normalize();
  };

  const moveCharacter = (dt: number) => {
    const { boundingCapsule: capsule, position } = store.character;

    store.character.position.addScaledVector(store.movement, dt);
    store.character.updateMatrixWorld();

    store.penInfo = computeCapsulePenetration(capsule.radius, capsule.halfHeight, store.character.matrix);

    if (store.penInfo) store.depenetrateVectorRaw.subVectors(store.penInfo.location, position);
    else store.depenetrateVectorRaw.set(0, 0, 0);

    store.depenetrateVector.copy(store.depenetrateVectorRaw);
    const offset = Math.max(0.0, store.depenetrateVector.length() - TOLERANCE);
    store.depenetrateVector.normalize().multiplyScalar(offset);

    store.character.position.add(store.depenetrateVector);
  };

  useUpdate(function mainLoopCCT(_, dt) {
    calculateMovement(dt);

    for (let i = 0; i < STEPS; i++) {
      moveCharacter(1 / STEPS);
    }

    updateGroundedState();
    updateMovementMode();
  }, Stages.Fixed);

  // Sync mesh so movement is visible.
  useUpdate(function syncLoopCCT(_, dt) {
    // We update the character matrix manually since it isn't part of the scene graph.
    if (transform) transform(store.character, dt);
    store.character.updateMatrix();
    meshRef.current.position.copy(store.character.position);
    meshRef.current.rotation.copy(store.character.rotation);
  }, Stages.Update);

  useUpdate(function debugLoopCCT() {
    if (!capsuleDebugRef.current || !debug) return;
    capsuleDebugRef.current.position.copy(store.character.position);
    capsuleDebugRef.current.updateMatrix();
  }, Stages.Late);

  const getVelocity = () => store.velocity;
  const getDeltaVector = () => store.depenetrateVector;
  const getIsGroundedMovement = () => store.isGroundedMovement;
  const getIsWalking = () => store.isGroundedMovement;
  const getIsFalling = () => store.isFalling;
  const getIsSliding = () => store.isSliding;
  const getIsNearGround = () => store.isNearGround;
  const getGroundNormal = () => store.groundNormal;
  const getSlopeLimit = () => slopeLimit;
  const getGroundAngle = () => store.groundAngle;
  const getCharacter = () => store.character;

  return (
    <CharacterControllerContext.Provider
      value={{
        addModifier,
        removeModifier,
        fsm,
        getVelocity,
        getDeltaVector,
        getIsGroundedMovement,
        getIsWalking,
        getIsFalling,
        getGroundNormal,
        getIsSliding,
        getIsNearGround,
        getSlopeLimit,
        getGroundAngle,
        getCharacter,
      }}>
      <group position={[0, -0.25, 0]}>
        <group ref={meshRef}>
          <>{children}</>
        </group>
      </group>
      {/* <AirCollision /> */}
      {debug && (
        <CapsuleWireframe
          ref={capsuleDebugRef}
          radius={store.character?.boundingCapsule.radius ?? 0}
          halfHeight={store.character?.boundingCapsule.halfHeight ?? 0}
        />
      )}
    </CharacterControllerContext.Provider>
  );
}
