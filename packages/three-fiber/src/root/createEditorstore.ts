import {
  Dpr,
  EventManager,
  RenderCallback,
  RootState,
  Size,
  ThreeEvent,
  Viewport,
  Camera,
  invalidate,
  advance
} from "@react-three/fiber"
import create, { StoreApi, UseBoundStore } from "zustand"
import * as THREE from "three"
import React from "react"

const isOrthographicCamera = (def: Camera): def is THREE.OrthographicCamera =>
  def && (def as THREE.OrthographicCamera).isOrthographicCamera

function calculateDpr(dpr: Dpr) {
  const target = typeof window !== "undefined" ? window.devicePixelRatio : 1
  return Array.isArray(dpr) ? Math.min(Math.max(dpr[0], target), dpr[1]) : dpr
}

type DomEvent = PointerEvent | MouseEvent | WheelEvent

export function updateCamera(
  camera: Camera & { manual?: boolean },
  size: Size
) {
  // https://github.com/pmndrs/react-three-fiber/issues/92
  // Do not mess with the camera if it belongs to the user
  if (!camera.manual) {
    if (isOrthographicCamera(camera)) {
      camera.left = size.width / -2
      camera.right = size.width / 2
      camera.top = size.height / 2
      camera.bottom = size.height / -2
    } else {
      camera.aspect = size.width / size.height
    }
    camera.updateProjectionMatrix()
    // https://github.com/pmndrs/react-three-fiber/issues/178
    // Update matrix world since the renderer is a frame late
    camera.updateMatrixWorld()
  }
}

type ViewportState = Viewport & {
  getCurrentViewport: (
    camera?: Camera,
    target?: THREE.Vector3 | Parameters<THREE.Vector3["set"]>,
    size?: Size
  ) => Omit<Viewport, "dpr" | "initialDpr">
}

export const createStore = (
  sceneProp: THREE.Scene,
  glProp: THREE.WebGLRenderer,
  cameraProp: THREE.Camera,
  sizeProp: Size,
  viewportProp: ViewportState
) => {
  const rootState = create<RootState>((set, get) => {
    const position = new THREE.Vector3()
    const defaultTarget = new THREE.Vector3()
    const tempTarget = new THREE.Vector3()
    function getCurrentViewport(
      camera: Camera = get().camera,
      target: THREE.Vector3 | Parameters<THREE.Vector3["set"]> = defaultTarget,
      size: Size = get().size
    ): Omit<Viewport, "dpr" | "initialDpr"> {
      const { width, height, top, left } = size
      const aspect = width / height
      if (target instanceof THREE.Vector3) tempTarget.copy(target)
      else tempTarget.set(...target)
      const distance = camera.getWorldPosition(position).distanceTo(tempTarget)
      if (isOrthographicCamera(camera)) {
        return {
          width: width / camera.zoom,
          height: height / camera.zoom,
          top,
          left,
          factor: 1,
          distance,
          aspect
        }
      } else {
        const fov = (camera.fov * Math.PI) / 180 // convert vertical fov to radians
        const h = 2 * Math.tan(fov / 2) * distance // visible height
        const w = h * (width / height)
        return {
          width: w,
          height: h,
          top,
          left,
          factor: width / w,
          distance,
          aspect
        }
      }
    }

    let performanceTimeout: ReturnType<typeof setTimeout> | undefined =
      undefined
    const setPerformanceCurrent = (current: number) =>
      set((state) => ({ performance: { ...state.performance, current } }))

    const pointer = new THREE.Vector2()

    const rootState: RootState = {
      set,
      get,

      // Mock objects that have to be configured
      gl: glProp as unknown as THREE.WebGLRenderer,
      camera: cameraProp as unknown as Camera,
      raycaster: new THREE.Raycaster(),
      //   raycaster: null as unknown as THREE.Raycaster,
      events: { priority: 1, enabled: true, connected: false },
      xr: null as unknown as { connect: () => void; disconnect: () => void },

      invalidate: (frames = 1) => invalidate(get(), frames),
      advance: (timestamp: number, runGlobalEffects?: boolean) =>
        advance(timestamp, runGlobalEffects, get()),

      legacy: false,
      linear: false,
      flat: false,
      scene: sceneProp,

      controls: null,
      clock: new THREE.Clock(),
      pointer,
      mouse: pointer,

      frameloop: "always",
      onPointerMissed: undefined,

      performance: {
        current: 1,
        min: 0.5,
        max: 1,
        debounce: 200,
        regress: () => {
          const state = get()
          // Clear timeout
          if (performanceTimeout) clearTimeout(performanceTimeout)
          // Set lower bound performance
          if (state.performance.current !== state.performance.min)
            setPerformanceCurrent(state.performance.min)
          // Go back to upper bound performance after a while unless something regresses meanwhile
          performanceTimeout = setTimeout(
            () => setPerformanceCurrent(get().performance.max),
            state.performance.debounce
          )
        }
      },

      //   size: { width: 0, height: 0, top: 0, left: 0, updateStyle: false },
      size: sizeProp,
      //   viewport: {
      //     initialDpr: 0,
      //     dpr: 0,
      //     width: 0,
      //     height: 0,
      //     top: 0,
      //     left: 0,
      //     aspect: 0,
      //     distance: 0,
      //     factor: 0,
      //     getCurrentViewport
      //   },
      viewport: viewportProp,

      setEvents: (events: Partial<EventManager<any>>) =>
        set((state) => ({ ...state, events: { ...state.events, ...events } })),
      setSize: (
        width: number,
        height: number,
        updateStyle?: boolean,
        top?: number,
        left?: number
      ) => {
        const camera = get().camera
        const size = {
          width,
          height,
          top: top || 0,
          left: left || 0,
          updateStyle
        }
        set((state) => ({
          size,
          viewport: {
            ...state.viewport,
            ...getCurrentViewport(camera, defaultTarget, size)
          }
        }))
      },
      setDpr: (dpr: Dpr) =>
        set((state) => {
          const resolved = calculateDpr(dpr)
          return {
            viewport: {
              ...state.viewport,
              dpr: resolved,
              initialDpr: state.viewport.initialDpr || resolved
            }
          }
        }),
      setFrameloop: (frameloop: "always" | "demand" | "never" = "always") => {
        const clock = get().clock

        // if frameloop === "never" clock.elapsedTime is updated using advance(timestamp)
        clock.stop()
        clock.elapsedTime = 0

        if (frameloop !== "never") {
          clock.start()
          clock.elapsedTime = 0
        }
        set(() => ({ frameloop }))
      },

      previousRoot: undefined,
      internal: {
        active: false,
        priority: 0,
        frames: 0,
        lastEvent: React.createRef(),

        interaction: [],
        hovered: new Map<string, ThreeEvent<DomEvent>>(),
        subscribers: [],
        initialClick: [0, 0],
        initialHits: [],
        capturedMap: new Map(),

        subscribe: (
          ref: React.MutableRefObject<RenderCallback>,
          priority: number,
          store: UseBoundStore<any>
        ) => {
          const internal = get().internal
          // If this subscription was given a priority, it takes rendering into its own hands
          // For that reason we switch off automatic rendering and increase the manual flag
          // As long as this flag is positive there can be no internal rendering at all
          // because there could be multiple render subscriptions
          internal.priority = internal.priority + (priority > 0 ? 1 : 0)
          internal.subscribers.push({ ref, priority, store })
          // Register subscriber and sort layers from lowest to highest, meaning,
          // highest priority renders last (on top of the other frames)
          internal.subscribers = internal.subscribers.sort(
            (a, b) => a.priority - b.priority
          )
          return () => {
            const internal = get().internal
            if (internal?.subscribers) {
              // Decrease manual flag if this subscription had a priority
              internal.priority = internal.priority - (priority > 0 ? 1 : 0)
              // Remove subscriber from list
              internal.subscribers = internal.subscribers.filter(
                (s) => s.ref !== ref
              )
            }
          }
        }
      }
    }

    return rootState
  })

  const state = rootState.getState()

  let oldSize = state.size
  let oldDpr = state.viewport.dpr
  let oldCamera = state.camera
  rootState.subscribe(() => {
    const { camera, size, viewport, gl, set } = rootState.getState()

    // Resize camera and renderer on changes to size and pixelratio
    if (size !== oldSize || viewport.dpr !== oldDpr) {
      oldSize = size
      oldDpr = viewport.dpr
      // Update camera & renderer
      updateCamera(camera, size)
      gl.setPixelRatio(viewport.dpr)
      gl.setSize(size.width, size.height, size.updateStyle)
    }

    // Update viewport once the camera changes
    if (camera !== oldCamera) {
      oldCamera = camera
      // Update viewport
      set((state) => ({
        viewport: {
          ...state.viewport,
          ...state.viewport.getCurrentViewport(camera)
        }
      }))
    }
  })

  // Invalidate on any change
  rootState.subscribe((state) => invalidate(state))

  // Return root state
  return rootState
}
