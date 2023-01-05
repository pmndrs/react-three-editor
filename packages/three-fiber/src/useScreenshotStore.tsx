import { EditorContext } from "@editable-jsx/editable"
import { createStore } from "@editable-jsx/state"
import { createMultiTunnel } from "@editable-jsx/ui"
import { createRoot, ReconcilerRoot, _roots } from "@react-three/fiber"
import { ReactNode, useLayoutEffect as useEffect, useRef } from "react"
import { editor } from "./editor"

export const screenshotTunnel = createMultiTunnel()

export const useScreenshotStore = createStore<{
  unregisterPreview: any
  registerPreview: any
  previews: { [key: string]: HTMLImageElement }
  canvas: HTMLCanvasElement | null
  setCanvas: (canvas: HTMLCanvasElement) => void
  root: ReconcilerRoot<any> | null
  previewId: string | null
  screenshot: (id?: string) => Promise<string>
}>("screenshot", (set, get) => ({
  previewId: null,
  previews: {},
  registerPreview: (id, ref) => {
    set((s) => {
      s.previews[id] = ref
      return { ...s }
    })
  },
  unregisterPreview: (id) => {
    set((s) => {
      delete s.previews[id]
      return { ...s }
    })
  },

  canvas: null as HTMLCanvasElement | null,
  root: null as ReconcilerRoot<any> | null,
  setCanvas: (canvas: HTMLCanvasElement) => {
    if (!canvas) return
    if (_roots.get(canvas)) return
    let root = createRoot(canvas).configure({
      gl: {
        preserveDrawingBuffer: true
      },
      camera: {
        position: [10, 10, 10]
      }
    })

    root.render(
      <EditorContext.Provider value={editor}>
        <ActiveScreenshot />
      </EditorContext.Provider>
    )

    set({ canvas, root })
  },
  screenshot: async (id?: string) => {
    if (id) {
      set({
        previewId: id
      })

      return new Promise((resolve) => {
        setTimeout(() => {
          get().previews[id].src = get().canvas!.toDataURL()
          set({
            previewId: null
          })
          resolve(get().previews[id].src)
        }, 500)

        // let resonse = useScreenshotStore.subscribe((s) => {
        //   if (s.previews[id].readyForPreview && s.previewId === id) {
        //     get().previews[id].src = get().canvas!.toDataURL()
        //     set({
        //       previewId: null
        //     })
        //     resonse()
        //     resolve(get().previews[id].src)
        //   }
        // })
      })
    } else {
      for (var key in get().previews) {
        await get().screenshot(key)
      }
      return ""
    }
  },

  scene: null as ReactNode | null
}))
const ActiveScreenshot = () => {
  const previewId = useScreenshotStore((s) => s.previewId)
  const tunnel = screenshotTunnel.useTunnels()

  if (previewId && tunnel[previewId]) {
    let Out = tunnel[previewId]!.Out
    return (
      <>
        <directionalLight position={[0, 0, 1]} />
        {/* <PerspectiveCamera makeDefault position={[1, 1, 1]} /> */}
        <ambientLight />
        {/* <Physics paused={true}> */}
        <group>
          <editor.ContextBridge>
            <Out />
          </editor.ContextBridge>
        </group>
      </>
    )
  }

  return null
}
export function ScreenshotCanvas() {
  const setCanvas = useScreenshotStore((s) => s.setCanvas)
  return (
    <>
      <div
        style={{
          width: "100px",
          height: "100px",
          position: "fixed",
          left: -1000,
          top: -1000
        }}
      >
        <canvas ref={(el) => setCanvas(el!)} hidden />
      </div>
    </>
  )
}

export function Screenshot({
  children,
  id,
  ...props
}: {
  children: ReactNode
  id: string
}) {
  const ref = useRef<HTMLImageElement>(null)
  const registerPreview = useScreenshotStore((s) => s.registerPreview)
  const unregisterPreview = useScreenshotStore((s) => s.unregisterPreview)

  useEffect(() => {
    registerPreview(id, ref.current)
    return () => {
      unregisterPreview(id)
    }
  }, [id, registerPreview, unregisterPreview])

  return (
    <>
      <img
        ref={ref}
        style={{
          width: "100px",
          height: "100px"
        }}
        {...props}
      />
      <>
        <screenshotTunnel.In id={id}>
          <EditorContext.Provider value={null}>
            {children}
          </EditorContext.Provider>
        </screenshotTunnel.In>
      </>
    </>
  )
}
