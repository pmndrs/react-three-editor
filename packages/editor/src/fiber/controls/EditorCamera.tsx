import { OrbitControls } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { levaStore } from "leva"
import { forwardRef, useEffect, useRef } from "react"
import { useHotkeysContext } from "react-hotkeys-hook"
import { Camera, Event, MathUtils } from "three"
import { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import { setEditable } from "../../editable/editable"
import { useEditorStore } from "../../editable/Editor"
import { useEditor } from "../../editable/useEditor"
import { ThreeEditor } from "../ThreeEditor"

setEditable(
  OrbitControls,
  forwardRef((props, ref) => {
    const isEditorMode = useEditor().useMode("editor")
    return isEditorMode ? null : (
      <OrbitControls {...props} makeDefault ref={ref} />
    )
  })
)

// @ts-ignore
window.leva = levaStore
export function EditorCamera() {
  const ref = useRef<Camera>(null!)
  const ref2 = useRef<OrbitControlsImpl>(null!)
  const editor = useEditor()
  const hotkeysContext = useHotkeysContext()

  const [props] = editor.useSettings("camera", {
    enabled: false,
    position: {
      value: [10, 10, 10],
      step: 0.1
    },
    rotation: {
      value: [0, 0, 0],
      step: 0.1
    },
    fov: { value: 75, min: 1, max: 180 },
    zoom: { value: 1, min: 0, max: 10 },
    near: { value: 0.1, min: 0.1, max: 100 },
    far: { value: 1000, min: 0.1, max: 10000 }
  })

  // useHotkeys(
  //   "meta+e",
  //   (e, a) => {
  //     setCamera({
  //       enabled: !props.enabled
  //     })
  //   },
  //   [props.enabled],
  //   {
  //     preventDefault: true
  //   }
  // )

  useSelectedState(editor)

  const camera = useThree((c) => c.camera)

  useEffect(() => {
    if (!ref.current) {
      ref.current = camera
    }
  }, [])

  const controls = useThree((c) => c.controls)

  useEffect(() => {
    function update(e: Event) {
      if (props.enabled) {
        editor.setSetting("camera.position", e.target.object.position.toArray())

        editor.setSetting(
          "camera.rotation",
          e.target.object.rotation
            .toArray()
            .slice(0, 3)
            .map((a) => MathUtils.radToDeg(a))
        )

        editor.setSetting("camera.fov", e.target.object.fov)
        editor.setSetting("camera.near", e.target.object.near)
        editor.setSetting("camera.far", e.target.object.far)
        editor.setSetting("camera.zoom", e.target.object.zoom)
      }
    }
    controls?.addEventListener("change", update)

    return () => {
      controls?.removeEventListener("change", update)
    }
  }, [controls, props.enabled])

  useEffect(() => {
    if (props.enabled && controls) {
      camera.position.fromArray(editor.getSettings("camera.position"))
      camera.rotation.fromArray(
        editor.getSettings("camera.rotation").map((a) => MathUtils.degToRad(a))
      )
      // camera.fov = props.fov
      // camera.near = props.near
      // camera.far = props.far
      // camera.zoom = props.zoom
    }
  }, [camera, controls])

  return (
    <>
      {/* {props.enabled && (
        <PerspectiveCamera
          ref={(el) => {
            editor.camera = el
          }}
          {...props}
          rotation={props.rotation.map((a) => MathUtils.degToRad(a))}
          makeDefault
        />
      )} */}
      {props.enabled && (!controls || ref2.current === controls) && (
        <OrbitControls ref={ref2} makeDefault />
      )}
      {/* <editable.primitive
        name="Camera"
        object={ref.current || camera}
        _source={{}}
      /> */}
      {/* <PerspectiveCamera makeDefault /> */}
    </>
  )
}

function useSelectedState(editor: ThreeEditor) {
  const selectedId = useEditorStore((s) => s.selectedId)
  const selectedKey = useEditorStore((s) => s.selectedKey)
  const [p, set] = editor.useSettings(
    "scene",
    {
      selectedId: {
        onChange(e, path, context) {
          if (context.initial) {
            editor?.selectId(e === "" ? null : e)
          }
        },
        transient: false,
        value: selectedId ?? ""
      },
      selectedKey: {
        onChange(e, path, context) {
          if (context.initial) {
            editor?.selectKey(e === "" ? null : e)
          }
        },
        transient: false,
        value: selectedKey ?? ""
      }
    },
    true
  )

  useEffect(() => {
    console.log(
      "selectedElement",
      selectedId && editor?.store.getState().elements[selectedId],
      selectedKey
    )

    editor.setSetting("scene.selectedId", selectedId ?? "")
    editor.setSetting("scene.selectedKey", selectedKey ?? "")
  }, [selectedId, selectedKey, set])
}
