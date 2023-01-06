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
          clock: folder({
            elapsedTime: { value: 0, disabled: true }
          }),
          events: folder({
            priorityE: { label: "priority", value: 1, disabled: true },
            enabled: { value: true, disabled: true },
            connected: { value: false, disabled: true }
          }),
          internal: folder({
            active: { value: false, disabled: true },
            priorityI: { label: "priority", value: 0, disabled: true },
            frames: { value: 0, disabled: true }
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

  data["fiber.clock.elapsedTime"].value = state.clock.elapsedTime

  data["fiber.events.priorityE"].value = state.events.priority
  data["fiber.events.enabled"].value = state.events.enabled
  data["fiber.events.connected"].value = state.events.connected

  data["fiber.internal.active"].value = state.internal.active
  data["fiber.internal.priorityI"].value = state.internal.priority
  data["fiber.internal.frames"].value = state.internal.frames
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
  addAfterEffect(() => {
    if (render && !render()) return
    const data = panel.getData() as any
    const state =
      data["fiber.root"].value === "appRoot"
        ? editor.appRoot!.store.getState()
        : editor.editorRoot!.store.getState()

    syncDataWithState(data, state)
    panel.setState({ data })
  })

  return null
}
