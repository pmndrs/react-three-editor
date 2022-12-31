import { useEditor } from "@editable-jsx/core"
import { Leva } from "leva"
import { multiToggle } from "../../ui/leva/multiToggle"
import { Panel } from "../../ui/panels/Panel"
import { DynamicIsland } from "./BottomBar"

export function EditorPanels() {
  const editor = useEditor()
  const selectedElement = editor.useState(() => editor.selectedElement)
  const [props] = editor.useSettings("panels.scene", {
    side: multiToggle({
      data: "left",
      options: ["left", "right"]
    }),
    floating: true,
    hidden: false
  })
  const [propertiesControls] = editor.useSettings("panels.properties", {
    side: multiToggle({
      data: "right",
      options: ["left", "right"]
    }),
    floating: true,
    hidden: false
  })
  const [settingsControls] = editor.useSettings("panels.settings", {
    side: multiToggle({
      data: "right",
      options: ["left", "right"]
    }),
    floating: true,
    hidden: false
  })
  const [dynamicIslandControls] = editor.useSettings("panels.island", {
    placement: multiToggle({
      data: "bottom",
      options: ["top", "bottom"]
    }),
    side: multiToggle({
      data: "center",
      options: ["left", "center", "right"]
    }),
    hidden: false
  })
  return (
    <>
      <Leva isRoot hidden />
      <Panel panel="scene" title="scene" order={0} lazy {...props} />
      {selectedElement ? (
        <Panel
          panel="properties"
          title="properties"
          key={selectedElement.id}
          order={1}
          {...propertiesControls}
        />
      ) : (
        <Panel
          panel="settings"
          title="settings"
          order={1}
          {...settingsControls}
        />
      )}
      <DynamicIsland {...dynamicIslandControls} />
    </>
  )
}
