import { Icon } from "@iconify/react"
import { Bounds, useBounds } from "@react-three/drei"
import { Canvas as FiberCanvas } from "@react-three/fiber"
import { Components } from "leva/plugin"
import { ComponentProps, forwardRef, useMemo, useState } from "react"
import { Toaster } from "react-hot-toast"
import {
  CommandBar,
  CommandBarControls
} from "../editable/controls/command-bar/CommandBar"
import { custom } from "../editable/controls/custom"
import { MultiToggle } from "../editable/controls/helpers"
import { Outs } from "../editable/controls/Outs"
import { Panel, usePanel } from "../editable/controls/Panel"
import { createMultiTunnel } from "../editable/controls/tunnels"
import { usePersistedControls } from "../editable/controls/usePersistedControls"
import { EditableElementContext } from "../editable/editable"
import { EditorContext } from "../editable/Editor"
import { useEditor } from "../editable/useEditor"
import { client } from "../vite/client"
import { CameraGizmos } from "./controls/CameraGizmos"
import { EditorCamera } from "./controls/EditorCamera"
import { PerformanceControls } from "./controls/PerformanceControls"
import { SceneControls } from "./controls/SceneControls"
import { SelectedElementControls } from "./controls/SelectedElementControls"
import { DEFAULT_EDITOR_PLUGINS } from "./plugins"
import { ThreeEditor } from "./ThreeEditor"

export const editorTunnel = createMultiTunnel()

export const Editor = editorTunnel.In

export const Canvas = forwardRef<
  HTMLCanvasElement,
  ComponentProps<typeof FiberCanvas>
>(function Canvas({ children, _source, ...props }, ref) {
  const store = useMemo(
    () => new ThreeEditor(DEFAULT_EDITOR_PLUGINS, client),
    []
  )

  store.root.source = _source

  // @ts-ignore
  window.editor = store

  return (
    <EditorContext.Provider value={store}>
      <EditorCanvas ref={ref} store={store} {...props}>
        {children}
      </EditorCanvas>
      <Outs />
      <CommandBar />
      <Toaster />
    </EditorContext.Provider>
  )
})

const EditorCanvas = forwardRef<
  HTMLCanvasElement,
  {
    store: ThreeEditor
    children: any
  }
>(function EditorCanvas({ store, children, ...props }, ref) {
  const data = usePersistedControls(
    `world`,
    {
      mode: custom({
        ...props,
        data: "play",
        onChange: (value, path, { initial }) => {
          if (!initial) {
            store.setMode(value)
          }
        },
        transient: false,
        order: -1,
        component: (input) => {
          return (
            <Components.Row input>
              <Components.Label>{input.label}</Components.Label>
              <MultiToggle.Root>
                <MultiToggle.Option value="editor">
                  <Icon icon="ph:pencil" />
                  edit
                </MultiToggle.Option>
                <MultiToggle.Option value="play">
                  <Icon icon="ph:play-fill" />
                  play
                </MultiToggle.Option>
              </MultiToggle.Root>
            </Components.Row>
          )
        }
      })
    },
    [],
    usePanel(store.settingsPanel).store,
    false,
    0,
    false
  )

  const [settings] = store.useSettings("scene", {
    shadows: {
      value: true
    }
  })

  const [key, setKey] = useState(0)

  store.remount = () => {
    store.root.childIds = []
    setKey((k) => k + 1)
  }

  return (
    <FiberCanvas
      {...settings}
      ref={ref}
      onPointerMissed={(e: any) => {
        store.clearSelection()
      }}
      {...props}
    >
      <EditorContext.Provider value={store}>
        <EditorCamera />
        <Bounds margin={2}>
          <AssignBounds />
          <EditableElementContext.Provider key={key} value={store.root}>
            {children}
          </EditableElementContext.Provider>
        </Bounds>
        <editorTunnel.Outs
          fallback={
            <>
              <Panel
                id="default"
                title="properties"
                collapsed={false}
                pos="right"
                width={320}
              />
              <Panel
                id="scene"
                title="scene"
                pos="left"
                width={320}
                collapsed={false}
              />
              <SceneControls store="scene" />
              <SelectedElementControls store="default" />
              <PerformanceControls store="scene" />
              <CommandBarControls />
              <CameraGizmos />
            </>
          }
        />
      </EditorContext.Provider>
    </FiberCanvas>
  )
})

function AssignBounds() {
  const editor = useEditor()
  const bounds = useBounds()

  editor.bounds = bounds

  return null
}
