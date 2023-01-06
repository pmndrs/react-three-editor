import { Root } from "./createEditorRoot"

export type PrevFrameLoop = null | "always" | "demand" | "never"
export type RootControlState = {
  prevFrameloop: PrevFrameLoop
  prevElapsedTime: number
}
const controlStore = new Map<Root, RootControlState>()

export function suspendRoot(root: Root) {
  const rootState = root.store.getState()
  const controlState: RootControlState = controlStore.get(root) ?? {
    prevFrameloop: null,
    prevElapsedTime: 0
  }

  if (!controlStore.has(root)) controlStore.set(root, controlState)

  controlState.prevFrameloop = rootState.frameloop
  rootState.set({
    frameloop: "never",
    internal: { ...rootState.internal, active: false }
  })
  controlState.prevElapsedTime = rootState.clock.getElapsedTime()
  rootState.clock.stop()
  rootState.setEvents({ enabled: false })
}

export function resumeRoot(root: Root) {
  const rootState = root.store.getState()
  const controlState: RootControlState = controlStore.get(root) ?? {
    prevFrameloop: null,
    prevElapsedTime: 0
  }

  if (!controlStore.has(root)) controlStore.set(root, controlState)

  if (controlState.prevFrameloop !== null) {
    rootState.set({ frameloop: controlState.prevFrameloop })
  }
  rootState.set({ internal: { ...rootState.internal, active: true } })
  rootState.clock.start()
  rootState.clock.elapsedTime = controlState.prevElapsedTime
  rootState.setEvents({ enabled: true })
}
