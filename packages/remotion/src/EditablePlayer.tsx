import { CommandBar } from "@editable-jsx/commander"
import { Editor, setEditable, useEditor } from "@editable-jsx/editable"
import { PanelContainer, PanelGroup } from "@editable-jsx/panels"
import { SettingsContext } from "@editable-jsx/state"
import {
  createMultiTunnel,
  Floating,
  FloatingContext,
  Toaster
} from "@editable-jsx/ui"
import { client } from "@editable-jsx/vite/src/client"
import {
  Player as RemotionPlayer,
  PlayerProps,
  PlayerRef
} from "@remotion/player"
// import { Props } from "@react-three/fiber"
import { forwardRef, useMemo } from "react"

export const propControls = {
  applicable: (entity) => true,
  controls: (entity) => {
    let controls: Record<string, any> = {}
    if (entity.type.controls) {
      Object.entries(entity.type.controls)
        .map(([k, { type = "unknown", value, ...v }]: any) => {
          return [
            k,
            primitives[type as keyof typeof primitives]({
              ...v,
              element: entity,
              path: ["currentProps", k],
              default: value
            })
          ]
        })
        .forEach(([k, v]) => {
          controls[k] = v
        })
    }

    let IGNORED_PROPS = ["_source", "children"]

    let isControllable = (v: any) => {
      return (
        typeof v === "number" ||
        typeof v === "string" ||
        typeof v === "boolean" ||
        Array.isArray(v)
      )
    }

    Object.entries(entity.currentProps).forEach(([k, v]) => {
      if (!controls[k] && !IGNORED_PROPS.includes(k) && isControllable(v)) {
        let val = entity.currentProps[k]

        let props = {}
        if (typeof val === "number") {
          props.step = val / 100.0
          if (val % 1 === 0) {
            props.step = 1
          }
        }
        controls[k] = primitives.unknown({
          element: entity,
          path: ["currentProps", k],
          ...props
        })
      }
    })

    console.log(controls)
    return controls
  }
}

export const style = {
  applicable: (entity) => entity.forwardedRef,
  controls: (entity) => {
    let controls: Record<string, any> = {}

    let IGNORED_PROPS = ["_source", "children"]

    let isControllable = (v: any) => {
      return (
        typeof v === "number" ||
        typeof v === "string" ||
        typeof v === "boolean" ||
        Array.isArray(v)
      )
    }

    Object.entries(entity.currentProps.style ?? {}).forEach(([k, v]) => {
      if (!controls[k] && !IGNORED_PROPS.includes(k) && isControllable(v)) {
        let val = entity.currentProps[k]

        let props = {}
        if (typeof val === "number") {
          props.step = val / 100.0
          if (val % 1 === 0) {
            props.step = 1
          }
        }
        controls[k] = primitives.unknown({
          element: entity,
          path: ["ref", "style", k],
          ...props
        })
      }
    })

    console.log(controls)
    return controls
  }
}

export const styleWithoutRef = {
  applicable: (entity) => true,
  controls: (entity) => {
    let controls: Record<string, any> = {}

    let IGNORED_PROPS = ["_source", "children"]

    let isControllable = (v: any) => {
      return (
        typeof v === "number" ||
        typeof v === "string" ||
        typeof v === "boolean" ||
        Array.isArray(v)
      )
    }

    Object.entries(entity.currentProps.style ?? {}).forEach(([k, v]) => {
      if (!controls[k] && !IGNORED_PROPS.includes(k) && isControllable(v)) {
        let val = entity.currentProps[k]

        let props = {}
        if (typeof val === "number") {
          props.step = val / 100.0
          if (val % 1 === 0) {
            props.step = 1
          }
        }
        controls[k] = primitives.unknown({
          element: entity,
          path: ["currentProps", "style", k],
          ...props
        })
      }
    })

    console.log(controls)
    return controls
  }
}

const editor = new Editor([propControls, styleWithoutRef], client)

// @ts-ignore
window.editor = editor

export const EditorUI = createMultiTunnel()

import {
  CommandBarContext,
  CommandManagerContext
} from "@editable-jsx/commander"
import { EditorContext } from "@editable-jsx/editable"
import { PanelsProvider } from "@editable-jsx/panels"
import { EditorPanels } from "./EditorPanels"
import { EditorRoot } from "./EditorRoot"
import { primitives } from "./primitives"
import { SceneControls } from "./SceneControls"
import { SelectedElementControls } from "./SelectedElementControls"

function FloatingWindow({ children }: { children: any }) {
  return children({ width: window.innerWidth })
}

export function RemotionEditorProvider({
  editor,
  children
}: {
  editor: ReturnType<typeof useEditor>
  children: React.ReactNode
}) {
  return (
    <EditorContext.Provider value={editor}>
      <SettingsContext.Provider value={editor}>
        <CommandManagerContext.Provider value={editor.commands}>
          <CommandBarContext.Provider value={editor.commandBar}>
            <PanelsProvider manager={editor.panels}>
              <FloatingContext.Provider value={FloatingWindow}>
                {children}
              </FloatingContext.Provider>
            </PanelsProvider>
          </CommandBarContext.Provider>
        </CommandManagerContext.Provider>
      </SettingsContext.Provider>
    </EditorContext.Provider>
  )
}

export const Player = forwardRef<
  PlayerRef,
  PlayerProps<{}> & { component: React.FC }
>((props, ref) => {
  return (
    <RemotionEditorProvider editor={editor}>
      {/* Registers all the commands: keyboard shortcuts & command palette */}
      {/* <AllCommands /> */}

      {/* Panels active in the editor */}
      <EditorPanels />
      <SelectedElementControls />

      {/* Editor layout and the Canvas in the middle */}
      <PanelContainer>
        <PanelGroup side="left" />
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#CBD5E1"
          }}
        >
          <div
            style={{
              background: "white"
            }}
          >
            <EditablePlayer {...props} />
          </div>
        </div>
        {/* <EditableCanvas {...props} ref={ref} /> */}
        <PanelGroup side="right" />
      </PanelContainer>

      {/* Tray of user component library to pick and place entities */}
      {/* <ComponentsTray /> */}

      {/* Command bar dialog */}
      <CommandBar.Out />

      {/* Floating UI, panels, bottom bar */}
      <Floating.Out />

      {/* Toaster for alerts */}
      <Toaster />

      {/* Headless canvas for screenshots */}
      {/* <ScreenshotCanvas /> */}
    </RemotionEditorProvider>
  )
})

export const EditablePlayer = forwardRef<
  PlayerRef,
  PlayerProps<{}> & { component: React.FC }
>(function EditorCanvas(props, ref) {
  const editor = useEditor()
  const canvasSettings = editor.useSettings("scene", {
    shadows: {
      value: true
    }
  })

  const VideoRoot = useMemo(
    () => createVideoRoot(props.component),
    [props.component]
  )

  return <RemotionPlayer ref={ref} {...props} component={VideoRoot} />
})

function createVideoRoot(Component: any) {
  return function VideoRoot(props) {
    const [editableElement, { children }] = editor.useElement("root", {
      ...props,
      id: "root"
    })
    return (
      <>
        <EditorRoot element={editableElement}>
          <Component {...props} />
          <SceneControls />
        </EditorRoot>
      </>
    )
  }
}

setEditable(Player, Player)
