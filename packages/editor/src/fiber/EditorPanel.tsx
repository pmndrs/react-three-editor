import * as THREE from "three"
import React, { useId } from "react"
import { EntityTransformControls } from "./EntityTransformControls"
import { EntityEditor, entityPanel, EntityTree } from "./EntityEditor"
import tunnel from "tunnel-rat"
import { useEditor } from "."
import create from "zustand"
import { folder, Leva, useControls } from "leva"
export const SidebarTunnel = tunnel()
import { OrbitControls } from "@react-three/drei"

export let useTunnels = create((set) => ({}))

function In({ children }) {
  const id = useId()
  let oldTunnel = useTunnels((state) => state[id])
  if (!oldTunnel) {
    oldTunnel = tunnel()
    useTunnels.setState({
      [id]: oldTunnel
    })
  }

  return <oldTunnel.In>{children}</oldTunnel.In>
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
        {/* <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 100,
            background: "white",
            padding: 10
          }}
        >
          <pre>{JSON.stringify(Object.keys(p), null, 2)}</pre>
        </div> */}
      </In>
      {/* <TopLevelTransformControls /> */}
      {/* <TopLevelEntities /> */}
      <SceneGraph />
      <SelectedTransformControls />
      <SelectedEntityControls />
      <OrbitControls makeDefault />
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

function SceneGraph() {
  const p = useEditor((state) => Object.values(state.elements))

  useControls(() => {
    const items = {}
    p.forEach((v) => {
      if (v.parentId == null)
        items[v.name] = entityPanel({
          entity: v,
          panel: false,
          collapsed: true,
          children: true
        })
    })
    return {
      scene: folder(items)
    }
  }, [p])
  return null
  // return (
  //   <>
  //     {p.map((e) =>
  //       e.parentId == null ? <EntityTree key={e.name} entity={e} /> : null
  //     )}
  //   </>
  // )
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
  useControls("entity", {
    [entity.name]: entityPanel({
      entity,
      panel: true,
      collapsed: false,
      children: false
    })
  })
  return null
}
