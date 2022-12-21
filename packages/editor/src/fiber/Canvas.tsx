import { forwardRef, Fragment, PropsWithChildren, useMemo } from "react"
import { createMultiTunnel } from "./tunnels"
import { CanvasProps, Canvas as FiberCanas } from "@react-three/fiber"
import { Editor, EditorContext } from "../editable"
import { client } from "../vite/client"

export const editorTunnel = createMultiTunnel()
export const { In, Outs } = createMultiTunnel()

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ children, ...props }, forwardedRef) => {
    const store = useMemo(() => new Editor(client), [])
    return (
      <EditorContext.Provider value={store}>
        <EditorCanvas ref={forwardedRef} store={store} {...props}>
          {children}
        </EditorCanvas>
      </EditorContext.Provider>
    )
  }
)

export const EditorCanvas = forwardRef<
  HTMLCanvasElement,
  PropsWithChildren<{ store: Editor }>
>(({ store, children, ...props }, forwardedRef) => {
  return (
    <FiberCanas {...props} ref={forwardedRef}>
      <EditorContext.Provider value={store}>
        {children}
        <editorTunnel.Outs fallback={<Fragment />} />
      </EditorContext.Provider>
    </FiberCanas>
  )
})
