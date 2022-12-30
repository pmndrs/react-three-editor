import { CommandBarControls } from "../../commandbar"
import { useEditor } from "../../editable"
import { FloatingPanels } from "../../ui/panels/panel-tunnels"
import { PerformanceControls } from "./PerformanceControls"
import { SceneControls } from "./SceneControls"
import { SelectedElementControls } from "./SelectedElementControls"

export function EditorControls() {
  const { grid, axes } = useEditor().useSettings("helpers", {
    grid: true,
    axes: true
  })
  
  return (
    <>
      <FloatingPanels.Outs />

      <SelectedElementControls store={"properties"} />
      <SceneControls store={"scene"} />
      <CommandBarControls />
      <PerformanceControls store={"settings"} />
      {grid && <gridHelper />}
      {axes && <axesHelper />}
    </>
  )
}
