import { EditorContext, useEditor } from "@editable-jsx/editable"
import { toggle } from "@editable-jsx/ui"
import * as fiber from "@react-three/fiber"
import { folder, useControls } from "leva"
import { useContext } from "react"
import { editor } from "./editor"

export let Stages = fiber.Stages || {}

export function useEditorFrame(
  name: string,
  fn: fiber.RenderCallback,
  ...args: any
) {
  const editor = useContext(EditorContext)
  if (!editor) return fiber.useFrame(fn, ...args)

  const isEditorMode = editor.useStates("editing")
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
      store: editor.settings.store
    }
  )
  return fiber.useFrame((...args) => {
    if (controls.all && controls[name]) {
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
  const isEditorMode = editor.useStates("editing")
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
      store: editor.settings.store
    }
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
      store: editor.settings.store
    }
  )
  return fiber.useUpdate((...args) => {
    if (controls.useUpdate) {
      fn(...args)
    }
  }, ...args)
}
