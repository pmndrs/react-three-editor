import { RenderCallback, useFrame as useFiberFrame } from "@react-three/fiber"
import { folder, useControls } from "leva"
import { useEditor } from "../editable/Editor"
import { Toggle } from "./Toggle"

export function useEditorFrame(name: string, fn: RenderCallback, ...args: any) {
  const editor = useEditor()

  const panelStore = editor.usePanel("scene")
  let controls = useControls(
    {
      "frame updates": folder(
        {
          all: Toggle({
            value: true
          }),
          [name]: Toggle({
            value: true
          })
        },
        {
          order: 1000,
          collapsed: true
        }
      )
    },
    {
      store: panelStore
    }
  )
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
