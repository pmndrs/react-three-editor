import * as fiber from "@react-three/fiber"
import { folder, useControls } from "leva"
import { usePanel } from "../editable/controls/Panel"
import { toggle } from "../editable/controls/toggle"
import { useEditor } from "../editable/useEditor"

export let Stages = fiber.Stages || {}

export function useEditorFrame(
  name: string,
  fn: fiber.RenderCallback,
  ...args: any
) {
  const editor = useEditor()
  const settingsPanel = editor.store((s) => s.settingsPanel)
  const panelStore = usePanel(settingsPanel)
  const isEditorMode = editor.useMode("editor")
  let controls = useControls(
    "world.updates",
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
    },
    {
      store: panelStore.store
    },
    [panelStore.store]
  )
  return fiber.useFrame((...args) => {
    if (!isEditorMode && controls.all && controls[name]) {
      fn(...args)
    }
  }, ...args)
}

export function useEditorUpdate(
  name: string,
  fn: fiber.RenderCallback,
  ...args: any
) {
  const editor = useEditor()
  const settingsPanel = editor.store((s) => s.settingsPanel)
  const panelStore = usePanel(settingsPanel)
  const isEditorMode = editor.useMode("editor")
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
  return fiber.useUpdate((...args) => {
    if (!isEditorMode && controls.all && controls[name]) {
      fn(...args)
    }
  }, ...args)
}

export function useFrame(fn: fiber.RenderCallback, ...args: any) {
  return useEditorFrame("useFrame", fn, ...args)
}

export function useUpdate(fn: fiber.RenderCallback, ...args: any) {
  const loopName = fn.name
  let controls = useControls(
    {
      "frame updates": folder({
        [loopName?.length ? loopName : "useUpdate"]: toggle({
          value: true
        })
      })
    },
    {
      store: usePanel("scene").store
    }
  )
  return fiber.useUpdate((...args) => {
    if (controls.useUpdate) {
      fn(...args)
    }
  }, ...args)
}
