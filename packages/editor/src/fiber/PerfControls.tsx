import { folder, useControls } from "leva"
import { StoreType } from "leva/dist/declarations/src/types"
import { Perf, usePerf } from "r3f-perf"
import { useEffect } from "react"
import { useEditor } from "../editable/Editor"

export function PerfControls({ store }: { store: StoreType }) {
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
          order: 1002
        }
      )
    },
    {
      store: store
    },
    []
  )

  return null
}

export function PerformanceControls() {
  return (
    <>
      <Perf headless />
      <PerfControls store={useEditor().usePanel("scene")} />
      <PerformanceMonitor store={useEditor().usePanel("scene")} />
    </>
  )
}

function PerformanceMonitor({ store }: { store: StoreType }) {
  const perf = usePerf()

  useEffect(() => {
    let data = store.getData()
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
    store.useStore.setState({ data })
  }, [perf])

  return null
}
