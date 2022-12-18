import { folder, useControls } from "leva"
import { StoreType } from "leva/dist/declarations/src/types"
import { Perf, usePerf } from "r3f-perf"
import { useEffect } from "react"
import { usePanel } from "./usePanel"

export function PerfControls({
  store = "scene",
  order
}: {
  store?: StoreType | string
  order?: number
}) {
  const panel = usePanel(store)

  useControls(
    {
      performance: folder(
        {
          fps: { value: 60, disabled: true },
          gpu: { value: 0, disabled: true, suffix: "ms" },
          render: folder({
            frame: { value: 373, disabled: true },
            calls: { value: 31, disabled: true },
            triangles: { value: 874, disabled: true },
            points: { value: 176, disabled: true },
            lines: { value: 0, disabled: true }
          }),
          memory: folder({
            used: { value: 0, disabled: true, suffix: "MB" },
            geometries: { value: 0, disabled: true },
            textures: { value: 0, disabled: true }
          })
        },
        {
          collapsed: true,
          order: order
        }
      )
    },
    {
      store: panel.store
    },
    []
  )

  return null
}

export function PerformanceControls({
  store = "scene",
  order
}: {
  store?: StoreType | string
  order?: number
}) {
  return (
    <>
      <Perf headless />
      <PerfControls store={store} order={order} />
      <PerformanceMonitor store={store} />
    </>
  )
}

function PerformanceMonitor({
  store = "scene"
}: {
  store?: StoreType | string
}) {
  const perf = usePerf()
  const panel = usePanel(store)

  useEffect(() => {
    let data = panel.getData()
    data["performance.fps"].value = perf.log?.fps ?? 60
    data["performance.gpu"].value = perf.log?.gpu ?? 0
    data["performance.render.frame"].value = perf.gl?.render?.frame ?? 0
    data["performance.render.calls"].value = perf.gl?.render?.calls ?? 0
    data["performance.render.triangles"].value = perf.gl?.render?.triangles ?? 0
    data["performance.render.points"].value = perf.gl?.render?.points ?? 0
    data["performance.render.lines"].value = perf.gl?.render?.lines ?? 0
    data["performance.memory.used"].value = perf.log?.mem ?? 0
    data["performance.memory.geometries"].value =
      perf.gl?.memory?.geometries ?? 0
    data["performance.memory.textures"].value = perf.gl?.memory?.textures ?? 0
    panel.useStore.setState({ data })
  }, [perf, panel])

  return null
}
