import {
  GizmoHelper,
  GizmoViewcube,
  GizmoViewport,
  OrbitControls,
  PerspectiveCamera,
  useHelper
} from "@react-three/drei"
import { folder, Leva, levaStore, useControls } from "leva"
import React, { useEffect } from "react"
import * as THREE from "three"
import tunnel from "tunnel-rat"
import { useEditor } from "./useEditor"
import { EntityControl, EntityEditor, entityPanel } from "./EntityEditor"
import { EntityTransformControls } from "./EntityTransformControls"
import { In } from "./components"
import { createPlugin, useInputContext } from "leva/plugin"
import { useFrame, useThree } from "@react-three/fiber"
import { CameraHelper } from "three"
import { eq } from "./eq"
import { editable } from "."

export const SidebarTunnel = tunnel()

export function EditorCamera() {
  const props = useControls(
    "editor",
    {
      camera: folder({
        enabled: false,
        position: {
          value: [-6.836465353768794, 3.1169378502902387, -2.747260436170274],
          step: 0.1
        },
        fov: { value: 75, min: 1, max: 180 },
        near: { value: 0.1, min: 0.1, max: 100 },
        far: { value: 1000, min: 0.1, max: 10000 }
      })
    },
    {
      collapsed: true,
      order: 1000
    }
  )

  const camera = useThree((c) => c.camera)

  const ref = React.useRef()
  useEffect(() => {
    if (!ref.current) {
      ref.current = camera
    }
    // console.log(camera)
  }, [])

  // useHelper(ref, CameraHelper)

  const controls = useThree((c) => c.controls)
  const ref2 = React.useRef()

  useEffect(() => {
    function update(e) {
      if (props.enabled) {
        console.log(e.target.object.position)
        levaStore.setValueAtPath(
          "editor.camera.position",
          e.target.object.position.toArray(),
          false
        )
      }
    }
    controls?.addEventListener("change", update)

    return () => {
      controls?.removeEventListener("change", update)
    }

    // levaStore.useStore.subscribe((s) => s.data["editor.camera.position"], {

    // })
  }, [controls, props.enabled])

  return (
    <>
      {props.enabled && <PerspectiveCamera {...props} makeDefault />}
      {props.enabled && (!controls || ref2.current === controls) && (
        <OrbitControls ref={ref2} onChange={console.log} makeDefault />
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
export function EditorPanel() {
  return (
    <>
      <In>
        <Leva
          theme={
            {
              // space: {
              //   rowGap: "2px",
              //   md: "10px"
              // },
              // sizes: {
              //   titleBarHeight: "28px"
              // }
            }
          }
        />
      </In>
      {/* <TopLevelTransformControls /> */}
      {/* <TopLevelEntities /> */}
      <SceneGraph />
      <SelectedTransformControls />
      <SelectedEntityControls />
      <GizmoHelper alignment="bottom-right" margin={[100, 100]}>
        <group scale={0.85}>
          <GizmoViewcube />
        </group>
        <group scale={1.75} position={[-30, -30, -30]}>
          <GizmoViewport
            labelColor="white"
            axisHeadScale={0.525}
            hideNegativeAxes
          />
        </group>
      </GizmoHelper>
      {/* <OrbitControls makeDefault /> */}
    </>
  )
}

function TopLevelEntities() {
  const p = useEditor((state) => Object.values(state.elements))
  return (
    <>
      {p.map((e) =>
        e.parentId == null ? <EntityEditor key={e.name} entity={e} /> : null
      )}
    </>
  )
}

function TopLevelTransformControls() {
  const p = useEditor((state) => Object.values(state.elements))
  return (
    <>
      {p.map((e) =>
        e.ref instanceof THREE.Object3D && e.parentId === null ? (
          <EntityTransformControls key={e.id} entity={e} />
        ) : null
      )}
    </>
  )
}

const sceneGraph = createPlugin<
  { items: object },
  {},
  {
    items: object
  }
>({
  normalize({ items }, path, data) {
    return { settings: { items }, value: {} }
  },
  component() {
    const context = useInputContext<{ settings: { items: object } }>()
    return (
      <div style={{ maxHeight: 280, overflow: "scroll" }}>
        {Object.values(context.settings.items).map((v) => (
          <EntityControl
            selected={false}
            entity={v}
            key={v.id}
            collapsed={true}
            setCollapsed={() => {}}
            showChildren={true}
            dirty={false}
            panel={false}
          />
        ))}
      </div>
    )
  }
})

function SceneGraph() {
  const p = useEditor((state) => Object.values(state.elements))

  useControls(() => {
    const items = {}
    p.forEach((v) => {
      if (v.parentId == null) items[v.name] = v
    })
    return {
      scene: folder(
        {
          graph: sceneGraph({
            items
          })
        },
        {
          order: -2
        }
      )
    }
  }, [p])
  return null
}

function SelectedTransformControls() {
  const p = useEditor((state) => state.selected)
  console.log(p)
  return p && p.ref instanceof THREE.Object3D ? (
    <EntityTransformControls key={p.id} entity={p} />
  ) : null
}

function SelectedEntityControls() {
  const p = useEditor((state) => state.selected)
  console.log(p)

  return p ? (
    <React.Fragment key={p.name}>
      <EntityEditor entity={p} />
      <EntityControls entity={p} />
    </React.Fragment>
  ) : null
}

function EntityControls({ entity }) {
  useControls(
    "entity",
    {
      [entity.name]: entityPanel({
        entity,
        panel: true,
        collapsed: false,
        children: false
      })
    },
    {
      order: -1
    }
  )
  return null
}
