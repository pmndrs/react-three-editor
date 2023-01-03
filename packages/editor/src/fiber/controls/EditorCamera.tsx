import { createEditable, setEditable, useEditor } from "@editable-jsx/core"
import { OrbitControls } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { levaStore } from "leva"
import { forwardRef, useEffect, useRef } from "react"
import { Camera, Event, MathUtils } from "three"
import { OrbitControls as OrbitControlsImpl } from "three-stdlib"

const EditableOrbitControls = createEditable(OrbitControls)

setEditable(
  OrbitControls,
  forwardRef((props, ref) => {
    const isEditorMode = useEditor().useStates("editing")
    return isEditorMode ? (
      <EditableOrbitControls {...props} enabled={false} ref={ref} />
    ) : (
      <EditableOrbitControls {...props} makeDefault ref={ref} />
    )
  })
)

// @ts-ignore
window.leva = levaStore
export function EditorCamera() {
  const ref = useRef<Camera>(null!)
  const ref2 = useRef<OrbitControlsImpl>(null!)
  const editor = useEditor()

  const cameraSettings = editor.useSettings("camera", {
    enabled: true,
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

  const camera = useThree((c) => c.camera)

  useEffect(() => {
    if (!ref.current) {
      ref.current = camera
    }
  }, [])

  const controls = useThree((c) => c.controls)

  useEffect(() => {
    function update(e: Event) {
      editor.settings.set({
        "camera.position": e.target.object.position.toArray(),
        "camera.rotation": e.target.object.rotation
          .toArray()
          .slice(0, 3)
          .map((a) => MathUtils.radToDeg(a)),
        "camera.fov": e.target.object.fov,
        "camera.near": e.target.object.near,
        "camera.far": e.target.object.far,
        "camera.zoom": e.target.object.zoom
      })
    }
    controls?.addEventListener("change", update)

    return () => {
      controls?.removeEventListener("change", update)
    }
  }, [controls, cameraSettings.enabled])

  useEffect(() => {
    if (cameraSettings.enabled && controls) {
      camera.position.fromArray(editor.settings.get("camera.position"))
      camera.rotation.fromArray(
        editor.settings.get("camera.rotation").map((a) => MathUtils.degToRad(a))
      )
    }
  }, [camera, controls])

  return (
    <>
      {cameraSettings.enabled && (!controls || ref2.current === controls) && (
        <OrbitControls ref={ref2} makeDefault />
      )}
    </>
  )
}
