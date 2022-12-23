/* eslint-disable @typescript-eslint/no-empty-function */
import { createMachine } from 'xstate';

export const movementMachine = createMachine(
  {
    id: 'character',
    predictableActionArguments: true,
    initial: 'falling',
    states: {
      walking: {
        on: { FALL: 'falling' },
        entry: 'onWalk',
      },
      falling: {
        on: { WALK: 'walking' },
        entry: 'onFall',
      },
    },
  },
  {
    actions: {
      onWalk: () => {},
      onFall: () => {},
    },
  },
);
