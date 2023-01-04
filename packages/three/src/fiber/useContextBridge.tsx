import { context as ThreeContext } from "@react-three/fiber"
import { FiberProvider, useFiber } from "its-fine"
import * as React from "react"
import { useMemo } from "react"

/**
 * Represents a react-context bridge provider component.
 */

export type ContextBridge = React.FC<React.PropsWithChildren<{}>>
// In development, React will warn about using contexts between renderers.
// Hide the warning because its-fine fixes this issue
// https://github.com/facebook/react/pull/12779
function wrapContext<T>(context: React.Context<T>): React.Context<T> {
  try {
    return Object.defineProperties(context, {
      _currentRenderer: {
        get() {
          return null
        },
        set() {}
      },
      _currentRenderer2: {
        get() {
          return null
        },
        set() {}
      }
    })
  } catch (_) {
    return context
  }
}
interface ReactInternal {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
    ReactCurrentOwner: React.RefObject<Fiber>
    ReactCurrentDispatcher: React.RefObject<{
      readContext<T>(context: React.Context<T>): T
    }>
  }
}
const { ReactCurrentOwner, ReactCurrentDispatcher } = (
  React as unknown as ReactInternal
).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
/**
 * React Context currently cannot be shared across [React renderers](https://reactjs.org/docs/codebase-overview.html#renderers) but explicitly forwarded between providers (see [react#17275](https://github.com/facebook/react/issues/17275)). This hook returns a {@link ContextBridge} of live context providers to pierce Context across renderers.
 *
 * Pass {@link ContextBridge} as a component to a secondary renderer to enable context-sharing within its children.
 */

export function useContextBridge(): ContextBridge {
  const fiber = useFiber()
  const [contexts] = React.useState(() => new Map<React.Context<any>, any>())

  // Collect live context
  contexts.clear()
  let node = fiber
  while (node) {
    const context = node.type?._context
    if (context && context !== ThreeContext && !contexts.has(context)) {
      contexts.set(
        context,
        ReactCurrentDispatcher.current?.readContext(wrapContext(context))
      )
    }
    node = node.return!
  }

  // Flatten context and their memoized values into a `ContextBridge` provider
  return useMemo(
    () =>
      Array.from(contexts.keys()).reduce(
        (Prev, context) => (props) =>
          (
            <Prev>
              <context.Provider {...props} value={contexts.get(context)} />
            </Prev>
          ),
        (props) => <FiberProvider {...props} />
      ),
    [contexts]
  )
}
