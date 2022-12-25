import { CommandBarControls } from "../../commandbar"
import { PanelGhost } from "../../editable/Ghost"
import { FloatingPanels } from "../../ui/panels/panel-tunnels"
import { SceneControls } from "./SceneControls"
import { SelectedElementControls } from "./SelectedElementControls"

export function EditorControls() {
  return (
    <>
      <FloatingPanels.Outs />
      <PanelGhost />

      <SelectedElementControls store={"properties"} />
      <SceneControls store={"scene"} />
      <CommandBarControls />
    </>
  )
}
