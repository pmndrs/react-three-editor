import { Html } from "@react-three/drei"
import {
  Canvas as FiberCanvas,
  context as ThreeContext,
  Props,
  useStore
} from "@react-three/fiber"
import { useSelector } from "@xstate/react"
import { FiberProvider, useFiber } from "its-fine"
import * as React from "react"
import { forwardRef, Suspense, useMemo } from "react"
import { Toaster } from "react-hot-toast"
import { CommandBar } from "../commandbar"
import { AllCommands } from "../commandbar/commands"
import { EditableElementContext, EditorContext, useEditor } from "../editable"
import { JSXSource } from "../types"
import { Outs } from "../ui/tunnel"
import { createMultiTunnel } from "../ui/tunnels"
import { CameraBounds } from "./CameraBounds"
import { ComponentsTray } from "./ComponentsTray"
import { EditorCamera } from "./controls/EditorCamera"
import { EditorControls } from "./controls/EditorControls"
import { EditorPanels } from "./controls/EditorPanels"
import { editor } from "./editor"
import { PanelGroup } from "./PanelGroup"
import { ScreenshotCanvas } from "./useScreenshotStore"
export const editorTunnel = createMultiTunnel()
export const Editor = editorTunnel.In
export type CanvasProps = Props & { _source: JSXSource }
export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  (props, ref) => {
    // @ts-ignore
    window.editor = editor

    return (
      <div
        style={{
          display: "contents"
        }}
      >
        <EditorContext.Provider value={editor}>
          <EditorPanels />
          <AllCommands />
          <ScreenshotCanvas />
          <ComponentsTray />
          <div
            style={{
              display: "flex",
              height: "100vh",
              flexDirection: "row",
              width: "100vw"
            }}
          >
            <PanelGroup side="left" />
            <EditorCanvas {...props} ref={ref} />
            <PanelGroup side="right" />
          </div>
          <CommandBar />
          <Outs />
          <Toaster />
        </EditorContext.Provider>
      </div>
    )
  }
)

function Ghost() {
  const store = useStore()
  let ref = React.useRef()
  const pointer = useSelector(useEditor().editorService, (state) => {
    if (!state.matches("editing.draggingGhost.placing")) {
      return [0, 0]
    }
    let prev = state.event?.state?.xy ?? [0, 0]
    if (ref.current) {
      let intersect = store.getState().raycaster.intersectObject(ref.current!)
      if (intersect.length) {
        console.log(intersect)
        return [intersect[0].point.x, intersect[0].point.z]
      }
    }

    

    return [prev[0] / 100, prev[1] / 100]
  })
  return (
    <>
      <mesh position={[pointer[0], 0, pointer[1]]}>
        <boxGeometry />
        <Html>{JSON.stringify(pointer)}</Html>
      </mesh>
      <mesh scale={100} rotation-x={[-Math.PI / 2]} ref={ref}>
        <planeGeometry />
      </mesh>
    </>
  )
}

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
const EditorCanvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  function EditorCanvas(props, ref) {
    const store = useEditor()
    const [settings] = store.useSettings("scene", {
      shadows: {
        value: true
      }
    })

    const [editableElement, { children, ...overrideProps }] = editor.useElement(
      "canvas",
      {
        ...props,
        id: "root"
      }
    )

    React.useLayoutEffect(() => {
      editableElement.index = "0"
      editor.rootId = editableElement.id
    }, [editableElement])
    return (
      <FiberCanvas
        ref={ref}
        onPointerMissed={(e: any) => {
          store.clearSelection()
        }}
        {...overrideProps}
        {...settings}
      >
        <EditorContext.Provider value={store}>
          <EditorCamera />

          <CameraBounds>
            <Suspense>
              <EditableElementContext.Provider value={editableElement}>
                <FiberProvider>
                  {children}
                  <Ghost />
                </FiberProvider>
              </EditableElementContext.Provider>
            </Suspense>
          </CameraBounds>
          <editorTunnel.Outs fallback={<EditorControls />} />
        </EditorContext.Provider>
      </FiberCanvas>
    )
  }
)

export function EditorRoot({ children, _source }) {
  const ContextBridge = useContextBridge()
  const fiber = useFiber()
  const [editableElement, props] = editor.useElement("canvas", {
    id: "root11",
    _source,
    children
  })

  React.useLayoutEffect(() => {
    editableElement.index = "0"
    editor.rootId = editableElement.id
  }, [editableElement])

  editor.ContextBridge = ContextBridge

  return (
    <EditableElementContext.Provider value={editableElement}>
      {props.children}
    </EditableElementContext.Provider>
  )
}
