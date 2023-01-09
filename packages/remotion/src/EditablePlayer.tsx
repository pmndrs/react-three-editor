import {
  EditableRoot,
  Editor,
  setEditable,
  useEditor
} from "@editable-jsx/editable"
import { mergeRefs } from "@editable-jsx/state"
import { createMultiTunnel } from "@editable-jsx/ui"
import { client } from "@editable-jsx/vite/src/client"
import { transform } from "@react-three/editor/src/plugins/plugins"
import {
  Player as RemotionPlayer,
  PlayerProps,
  PlayerRef
} from "@remotion/player"
// import { Props } from "@react-three/fiber"
import { forwardRef, useEffect, useRef } from "react"

import { EditableRootProvider } from "@editable-jsx/editable/src/EditableRootProvider"
import { Player } from "./Player"
import { propControls } from "./propControls"
import { styleWithoutRef } from "./styleWithoutRef"

export const editor = new Editor({
  plugins: [transform, propControls, styleWithoutRef],
  client
})

class EditableRemotionRoot extends EditableRoot {
  ref: PlayerRef = null as any
}

// @ts-ignore
window.editor = editor

export const EditorUI = createMultiTunnel()

export const EditablePlayer = forwardRef<
  PlayerRef,
  PlayerProps<{}> & { component: React.FC }
>(function EditablePlayer(props, ref) {
  const editor = useEditor()
  const localRef = useRef<PlayerRef>(null)
  const [editableRoot, overrideProps] = editor.document.useRoot(
    EditableRoot,
    {
      ...props
    },
    ref
  )
  const canvasSettings = editor.useSettings("scene", {
    initialFrame: {
      value: 0,
      render: () => false
    }
  })

  useEffect(() => {
    localRef.current?.addEventListener("frameupdate", (e) => {
      editor.modeSettings.set({
        "scene.initialFrame": e.detail.frame
      })
    })
  }, [])

  return (
    <RemotionPlayer
      ref={mergeRefs([overrideProps.ref, localRef])}
      {...props}
      {...canvasSettings}
      component={VideoRoot}
      inputProps={{
        component: props.component,
        root: editableRoot,
        ...props.inputProps
      }}
      clickToPlay={false}
    />
  )
})

function VideoRoot({
  component: Component,
  root,
  ...props
}: {
  component: React.FC
  root: EditableRoot
}) {
  return (
    <EditableRootProvider root={root}>
      <Component {...props} />
    </EditableRootProvider>
  )
}

setEditable(Player, Player)
setEditable(EditablePlayer, EditablePlayer)
