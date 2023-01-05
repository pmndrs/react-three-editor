import { usePanel } from "@editable-jsx/panels"
import { Panel } from "@editable-jsx/panels/src/PanelManager"
import { useThree } from "@react-three/fiber"
import { folder, useControls } from "leva"
import { StoreType } from "leva/dist/declarations/src/types"
import { useEffect } from "react"
import { useFrame } from "../useFrame"

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
          frameloop: { value: "always", disabled: true, order: 0 },
          clock: folder({
            elapsedTime: { value: 0, disabled: true },
            delta: { value: 0, pad: 4, disabled: true }
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

function useControlEffect(
  panel: Panel,
  render: (() => boolean) | undefined,
  key: string,
  value: any
) {
  return useEffect(() => {
    let data = panel.getData() as any
    if (render && !render()) {
      return
    }

    data[key].value = value

    panel.setState({ data })
  }, [panel, render, value, key])
}

function FiberMonitor({
  panel: id = "scene",
  render
}: {
  panel?: string
  render?: () => boolean
}) {
  const panel = usePanel(id)

  const frameloop = useThree((state) => state.frameloop)
  const active = useThree((state) => state.internal.active)
  const internalPriority = useThree((state) => state.internal.priority)
  const eventsPriority = useThree((state) => state.events.priority)
  const eventsEnabled = useThree((state) => state.events.enabled)
  const eventsConnected = useThree((state) => state.events.connected)

  useControlEffect(panel, render, "fiber.frameloop", frameloop)
  useControlEffect(panel, render, "fiber.internal.active", active)
  useControlEffect(panel, render, "fiber.internal.priorityI", internalPriority)
  useControlEffect(panel, render, "fiber.events.priorityE", eventsPriority)
  useControlEffect(panel, render, "fiber.events.enabled", eventsEnabled)
  useControlEffect(panel, render, "fiber.events.connected", eventsConnected)

  useFrame((state, delta) => {
    let data = panel.getData() as any
    if (render && !render()) {
      return
    }

    data["fiber.clock.elapsedTime"].value = state.clock.elapsedTime
    data["fiber.clock.delta"].value = delta
    data["fiber.internal.frames"].value = state.internal.frames

    panel.setState({ data })
  })

  return null
}
