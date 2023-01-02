import { useEditor } from "@editable-jsx/core"
import { Panel } from "@editable-jsx/panels"
import { Leva } from "leva"
import { multiToggle } from "../../ui/leva/multiToggle"
import { DynamicIsland } from "./BottomBar"

export function EditorPanels() {
  const editor = useEditor()
  const selectedElement = editor.useState(() => editor.selectedElement)
  const scenePanelSettings = editor.useSettings("panels.scene", {
    side: multiToggle({
      data: "left",
      options: ["left", "right"]
    }),
    floating: true,
    hidden: false
  })
  const propertiesPanelSettings = editor.useSettings("panels.properties", {
    side: multiToggle({
      data: "right",
      options: ["left", "right"]
    }),
    floating: true,
    hidden: false
  })
  const settingsPanelSettings = editor.useSettings("panels.settings", {
    side: multiToggle({
      data: "right",
      options: ["left", "right"]
    }),
    floating: true,
    hidden: false
  })
  const dynamicIslandSettings = editor.useSettings("panels.island", {
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
      <Panel
        panel="scene"
        title="scene"
        order={0}
        lazy
        {...scenePanelSettings}
      />
      {selectedElement ? (
        <Panel
          panel="properties"
          title="properties"
          key={selectedElement.id}
          order={1}
          {...propertiesPanelSettings}
        />
      ) : (
        <Panel
          panel="settings"
          title="settings"
          order={1}
          {...settingsPanelSettings}
        />
      )}
      <DynamicIsland {...dynamicIslandSettings} />
    </>
  )
}
