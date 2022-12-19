import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { levaStore } from "leva"
import { useEffect, useRef } from "react"
import { useHotkeysContext } from "react-hotkeys-hook"
import { Camera, Event, MathUtils } from "three"
import { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import { editable } from "../../editable/editable"
import { useEditor, useEditorStore } from "../../editable/Editor"
import { ThreeEditor } from "../ThreeEditor"

// @ts-ignore
window.leva = levaStore
export function EditorCamera() {
  const ref = useRef<Camera>(null!)
  const ref2 = useRef<OrbitControlsImpl>(null!)
  const editor = useEditor()
  const hotkeysContext = useHotkeysContext()

  const [props, setCamera] = editor.useSettings("camera", {
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
        editor.setSettings(
          "camera.position",
          e.target.object.position.toArray()
        )

        editor.setSettings(
          "camera.rotation",
          e.target.object.rotation
            .toArray()
            .slice(0, 3)
            .map((a) => MathUtils.radToDeg(a))
        )

        editor.setSettings("camera.fov", e.target.object.fov)
        editor.setSettings("camera.near", e.target.object.near)
        editor.setSettings("camera.far", e.target.object.far)
        editor.setSettings("camera.zoom", e.target.object.zoom)
      }
    }
    controls?.addEventListener("change", update)

    return () => {
      controls?.removeEventListener("change", update)
    }
  }, [controls, props.enabled])

  return (
    <>
      {props.enabled && (
        <PerspectiveCamera
          ref={(el) => {
            editor.camera = el
          }}
          {...props}
          rotation={props.rotation.map((a) => MathUtils.degToRad(a))}
          makeDefault
        />
      )}
      {props.enabled && (!controls || ref2.current === controls) && (
        <OrbitControls ref={ref2} makeDefault />
      )}
      <editable.primitive
        name="Camera"
        object={ref.current || camera}
        _source={{}}
      />
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

    editor.setSettings("scene.selectedId", selectedId ?? "")
    editor.setSettings("scene.selectedKey", selectedKey ?? "")
  }, [selectedId, selectedKey, set])
}
