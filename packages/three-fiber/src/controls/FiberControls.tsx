import { useEditor } from "@editable-jsx/editable"
import { usePanel } from "@editable-jsx/panels"
import { Panel } from "@editable-jsx/panels/src/PanelManager"
import {
  addAfterEffect,
  addTail,
  RootState,
  useThree
} from "@react-three/fiber"
import { folder, useControls } from "leva"
import { StoreType } from "leva/dist/declarations/src/types"
import { useLayoutEffect } from "react"
import { ThreeEditor } from "../ThreeEditor"

function FiberDisplay({
  panel: id = "settings",
  order = 0,
  render
}: {
  panel?: string
  order?: number
  render?: () => boolean
}) {
  const panel = usePanel(id)

  useControls(
    {
      fiber: folder(
        {
          root: {
            options: { app: "appRoot", editor: "editorRoot" },
            order: -10
          },
          frameloop: { value: "always", disabled: true, order: -1 },
          pointer: { value: { x: 0, y: 0 }, disabled: true, order: 0 },
          size: folder({
            width: { value: 0, disabled: true },
            height: { value: 0, disabled: true },
            top: { value: 0, disabled: true },
            left: { value: 0, disabled: true },
            updateStyle: { value: false, disabled: true }
          }),
          camera: folder({
            type: { value: "undefined", disabled: true },
            uuid: { value: "undefined", disabled: true },
            name: { value: "undefined", disabled: true }
          }),
          clock: folder({
            elapsedTime: { value: 0, disabled: true }
          }),
          events: folder({
            priorityE: { label: "priority", value: 1, disabled: true },
            enabled: { value: true, disabled: true },
            connected: { value: "undefined", disabled: true }
          }),
          internal: folder({
            active: { value: false, disabled: true },
            priorityI: { label: "priority", value: 0, disabled: true },
            frames: { value: 0, disabled: true },
            initialClick: { value: { x: 0, y: 0 }, disabled: true }
          })
        },
        {
          collapsed: true,
          order: order,
          render
        }
      )
    },
    {
      store: panel.store as StoreType
    },
    []
  )

  return null
}

export function FiberControls({
  panel = "scene",
  order = 0,
  render
}: {
  panel?: string
  order?: number
  render?: () => boolean
}) {
  return (
    <>
      <FiberDisplay panel={panel} order={order} render={render} />
      <FiberMonitor panel={panel} />
    </>
  )
}

function syncDataWithState(data: any, state: RootState) {
  data["fiber.frameloop"].value = state.frameloop
  data["fiber.pointer"].value = { x: state.pointer.x, y: state.pointer.y }

  data["fiber.size.height"].value = `${state.size?.height}`
  data["fiber.size.width"].value = `${state.size?.width}`
  data["fiber.size.top"].value = `${state.size?.top}`
  data["fiber.size.left"].value = `${state.size?.left}`
  data["fiber.size.updateStyle"].value = `${state.size?.updateStyle}`

  data["fiber.camera.type"].value = `${state.camera?.type}`
  data["fiber.camera.name"].value = `${state.camera?.name}`
  data["fiber.camera.uuid"].value = `${state.camera?.uuid}`

  data["fiber.clock.elapsedTime"].value = state.clock.elapsedTime

  data["fiber.events.priorityE"].value = state.events.priority
  data["fiber.events.enabled"].value = state.events.enabled
  data["fiber.events.connected"].value =
    state.events.connected === false
      ? "false"
      : state.events.connected === undefined
      ? "undefined"
      : state.events.connected.nodeName.toLowerCase()

  data["fiber.internal.active"].value = state.internal.active
  data["fiber.internal.priorityI"].value = state.internal.priority
  data["fiber.internal.frames"].value = state.internal.frames
  data["fiber.internal.initialClick"].value = {
    x: state.internal.initialClick[0],
    y: state.internal.initialClick[1]
  }
}

function FiberMonitor({
  panel: id = "scene",
  render
}: {
  panel?: string
  render?: () => boolean
}) {
  const panel = usePanel(id)
  const editor = useEditor<ThreeEditor>()

  // The after effect never stops firing in v8 so we get constant updates.
  useLayoutEffect(() => {
    const unsub = addAfterEffect(() => {
      if (render && !render()) return

      const data = panel.getData() as any
      const state =
        data["fiber.root"].value === "appRoot"
          ? editor.appRoot!.store.getState()
          : editor.editorRoot!.store.getState()

      syncDataWithState(data, state)
      panel.setState({ data })
    })
    return () => unsub()
  }, [editor, panel, render])

  return null
}
