import { useThree } from "@react-three/fiber"
import { useState } from "react"
import { CommandBarControls } from "../../commandbar"
import { useEditor } from "../../editable"
import { Panel } from "../../ui/Panel"
import { BottomBar } from "./BottomBar"
import { PerformanceControls } from "./PerformanceControls"
import { SceneControls } from "./SceneControls"
import { SelectedElementControls } from "./SelectedElementControls"

function PropertiesPanel() {
  const editor = useEditor()
  const size = useThree((s) => s.size)
  const selectedElement = editor.useState(() => editor.selectedElement)!
  const [run, setRun] = useState(0)
  if (selectedElement) {
    selectedElement.resetControls = () => {
      setRun((r) => r + 1)
    }
  }

  console.log(run, selectedElement.id)
  return (
    <Panel
      panel="properties"
      key={run}
      title="properties"
      pos="right"
      width={size.width < 1080 ? 280 : 320}
      collapsed={false}
    />
  )
}
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
        <PropertiesPanel />
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
      {/* <CameraGizmos /> */}
      <BottomBar />
    </>
  )
}
