import { RenderCallback, useFrame as useFiberFrame } from "@react-three/fiber"
import { folder, useControls } from "leva"
import { useEditor } from "../editable/Editor"
import { usePanel } from "./controls/Panel"
import { toggle } from "./controls/toggle"

export function useEditorFrame(name: string, fn: RenderCallback, ...args: any) {
  const editor = useEditor()
  const settingsPanel = editor.store((s) => s.settingsPanel)
  const panelStore = usePanel(settingsPanel)
  let controls = useControls(
    {
      "frame updates": folder(
        {
          all: toggle({
            value: true
          }),
          [name]: toggle({
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
      store: panelStore.store
    },
    [panelStore.store]
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
