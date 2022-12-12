import { RenderCallback, useFrame as useFiberFrame } from "@react-three/fiber"
import { folder, useControls } from "leva"

export function useFrame(fn: RenderCallback, ...args: any) {
  const loopName = fn.name
  let controls = useControls({
    update: folder({
      [loopName?.length ? loopName : "loop"]: {
        value: true
      }
    })
  })
  return useFiberFrame((...args) => {
    if (controls.loop) {
      fn(...args)
    }
  }, ...args)
}
