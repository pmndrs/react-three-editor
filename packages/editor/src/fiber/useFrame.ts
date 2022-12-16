import { RenderCallback, useFrame as useFiberFrame } from "@react-three/fiber"
import { folder, useControls } from "leva"

export function useEditorFrame(name: string, fn: RenderCallback, ...args: any) {
  console.log(name)
  let controls = useControls({
    update: folder({
      all: {
        value: true
      },
      [name]: {
        value: true
      }
    })
  })
  return useFiberFrame((...args) => {
    if (controls.all && controls[name]) {
      fn(...args)
    }
  }, ...args)
}

export function useFrame(fn: RenderCallback, ...args: any) {
  const loopName = fn.name
  let controls = useControls({
    update: folder({
      [loopName?.length ? loopName : "useFrame"]: {
        value: true
      }
    })
  })
  return useFiberFrame((...args) => {
    if (controls.useFrame) {
      fn(...args)
    }
  }, ...args)
}
