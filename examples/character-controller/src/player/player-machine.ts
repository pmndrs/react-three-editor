/* eslint-disable @typescript-eslint/no-empty-function */
import { createMachine } from 'xstate';

export const playerMachine = createMachine(
  {
    id: 'player',
    predictableActionArguments: true,
    initial: 'idling',
    states: {
      idling: {
        on: { FALL: 'falling', WALK: 'walking' },
        entry: 'onIdle',
        exit: 'onIdleExit',
      },
      walking: {
        on: { FALL: 'falling', IDLE: 'idling' },
        entry: 'onWalk',
        exit: 'onWalkExit',
      },
      falling: {
        on: { WALK: 'walking', IDLE: 'idling' },
        entry: 'onFall',
        exit: 'onFallExit',
      },
    },
  },
  {
    actions: {
      onIdle: () => {},
      onIdleExit: () => {},
      onWalk: () => {},
      onWalkExit: () => {},
      onFall: () => {},
      onFallExit: () => {},
    },
  },
);
