import { Panel, PanelResizeHandle } from "react-resizable-panels"
import { EditableElement, useEditor } from "../../editable"
import { Panel as LevaPanel } from "../../ui/Panel"
import { TitleWithFilter } from "../../ui/PanelTitle"
import { RightPanel } from "../Canvas"
import { BottomBar } from "./BottomBar"
import { SceneControls } from "./SceneControls"
import { SelectedElementControls } from "./SelectedElementControls"

function PropertiesPanel() {}

function ElementPanel({ element }: { element: EditableElement<any> }) {
  return (
    <RightPanel.In>
      <Panel id="properties" defaultSize={0.5} order={2}>
        <TitleWithFilter
          title="properties"
          setFilter={() => {}}
          toggled={true}
        />
        <div
          style={{
            height: "calc(100% - 28px)",
            overflow: "scroll",
            backgroundColor: "var(--leva-colors-elevation2)"
          }}
        >
          <LevaPanel
            panel="properties"
            key={element.id}
            title="properties"
            pos="right"
            width={320}
            collapsed={false}
          />
        </div>
      </Panel>
    </RightPanel.In>
  )
}

function SettingsPanel() {
  return (
    <RightPanel.In>
      <Panel id="properties" defaultSize={0.5} order={2}>
        <TitleWithFilter title="settings" setFilter={() => {}} toggled={true} />
        <div
          style={{
            height: "calc(100% - 28px)",
            overflow: "scroll",
            backgroundColor: "var(--leva-colors-elevation2)"
          }}
        >
          <LevaPanel
            panel="default"
            title="settings"
            width={320}
            collapsed={false}
            pos="right"
          />
        </div>
      </Panel>
    </RightPanel.In>
  )
}

function ScenePanel({ title, side, id, reveal, order = 0 }) {
  const editor = useEditor()

  return (
    <RightPanel.In>
      <Panel id={id} defaultSize={0.5} order={1}>
        <TitleWithFilter title={title} setFilter={() => {}} toggle={() => {}} />
        <div
          style={{
            height: "calc(100% - 36px)",

            overflow: "scroll",
            backgroundColor: "var(--leva-colors-elevation2)"
          }}
        >
          <LevaPanel
            panel={id}
            title={title}
            pos={side}
            width={320}
            collapsed={false}
            reveal={reveal}
          />
        </div>
        {order === 0 && (
          <PanelResizeHandle>
            <div className={"vertical-handle"} />
          </PanelResizeHandle>
        )}
      </Panel>
    </RightPanel.In>
  )
}

export function EditorControls() {
  // const size = useThree((s) => s.size)
  const editor = useEditor()
  const selectedElement = editor.useState(() => editor.selectedElement)
  return (
    <>
      <ScenePanel id="scene" title="scene" side="right" />
      {selectedElement ? (
        <ElementPanel element={selectedElement} />
      ) : (
        <SettingsPanel />
      )}

      {/* {!selectedElement && (
        <In>
          <Panel
            as
            LevaPanel
            size={size}
            panel="default"
            title="settings"
            width={320}
            collapsed={false}
            pos="right"
          />
        </In>
      )} */}
      <SceneControls store="scene" />
      <SelectedElementControls store="properties" order={-1} />
      {/* <PerformanceControls
        store="default"
        order={1010}
        render={() => editor.selectedElement === null}
      /> */}
      {/* <CommandBarControls /> */}
      {/* <CameraGizmos /> */}
      <BottomBar />
    </>
  )
}
