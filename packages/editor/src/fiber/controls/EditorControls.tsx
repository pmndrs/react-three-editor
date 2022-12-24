import { useThree } from "@react-three/fiber"
import { CommandBarControls } from "../../commandbar"
import { useEditor } from "../../editable"
import { Panel } from "../../ui/Panel"
import { BottomBar } from "./BottomBar"
import { CameraGizmos } from "./CameraGizmos"
import { PerformanceControls } from "./PerformanceControls"
import { SceneControls } from "./SceneControls"
import { SelectedElementControls } from "./SelectedElementControls"

export function EditorControls() {
  const size = useThree((s) => s.size)
  const editor = useEditor()
  const selectedElement = editor.useState(() => editor.selectedElement)
  return (
    <>
      <Panel
        panel="scene"
        title="scene"
        pos="left"
        width={size.width < 780 ? 240 : 320}
        collapsed={false}
        reveal
      />
      {selectedElement ? (
        <Panel
          panel="properties"
          key={selectedElement.id}
          title="properties"
          pos="right"
          width={size.width < 1080 ? 280 : 320}
          collapsed={false}
        />
      ) : (
        <Panel
          panel="default"
          title="settings"
          width={size.width < 1080 ? 280 : 320}
          collapsed={false}
          pos="right"
        />
      )}
      <SceneControls store="scene" />
      <SelectedElementControls store="properties" order={-1} />
      <PerformanceControls
        store="default"
        order={1010}
        render={() => editor.selectedElement === null}
      />
      <CommandBarControls />
      <CameraGizmos />
      <BottomBar />
    </>
  )
}
