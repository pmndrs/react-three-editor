import { useInterpret } from '@xstate/react';
import { CharacterControllerContext } from 'character/contexts/character-controller-context';
import { useContext, useEffect, useState } from 'react';
import * as THREE from 'three';
import { isEqualTolerance } from 'utilities/math';
import { playerMachine } from './player-machine';
import { usePlayer } from './player-store';

export function PlayerRig() {
  const { fsm: service, getVelocity, getIsNearGround } = useContext(CharacterControllerContext);
  const actions = usePlayer((state) => state.actions);
  const [store] = useState({
    active: null as null | THREE.AnimationAction,
    previous: null as null | THREE.AnimationAction,
    zeroVec: new THREE.Vector3(0, 0, 0),
  });

  function fadeToAction(name: string, duration: number) {
    store.previous = store.active;
    store.active = actions[name];

    if (store.previous === store.active || !store.previous || !store.active) return;

    if (store.previous !== store.active) {
      store.previous.fadeOut(duration);
    }

    if (store.active) store.active.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(duration).play();
  }

  useEffect(() => {
    actions?.Walking?.play();
    actions?.Idle?.play();
    store.active = actions?.Idle;
    console.log(actions);
  }, [actions, store]);

  const fsm = useInterpret(playerMachine, {
    actions: {
      onIdle: () => {
        console.log('idling');
        if (!actions) return;

        fadeToAction('Idle', 0.3);
      },
      onFall: () => {
        console.log('falling');
        if (!actions) return;

        fadeToAction('Fall Idle', 0.3);
      },
      onWalk: () => {
        console.log('walking');
        if (!actions) return;

        fadeToAction('Walk', 0.3);
      },
    },
  });

  service.onTransition((state) => {
    const velocity = getVelocity();
    const isNearGround = getIsNearGround();

    if (state.matches('walking')) {
      if (isEqualTolerance(velocity.x, 0) && isEqualTolerance(velocity.z, 0)) fsm.send('IDLE');
      else fsm.send('WALK');
    }

    if (state.matches('falling')) {
      // if (isNearGround) {
      //   if (velocity.x === 0 && velocity.z === 0) {
      //     fsm.send('IDLE');
      //   } else {
      //     fsm.send('WALK');
      //   }
      // } else {
      //   fsm.send('FALL');
      // }
      fsm.send('FALL');
    }
  });

  return null;
}
