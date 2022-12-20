// https://github.com/omgovich/react-colorful/blob/master/src/hooks/useEventCallback.ts

import { useRef } from 'react';

export function useEventHandler<T>(handler: T): T {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  return handlerRef.current;
}
