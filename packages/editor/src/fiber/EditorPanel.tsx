import { OrbitControls } from "@react-three/drei"
import { folder, Leva, useControls } from "leva"
import React from "react"
import * as THREE from "three"
import tunnel from "tunnel-rat"
import { useEditor } from "./useEditor"
import { EntityEditor, entityPanel } from "./EntityEditor"
import { EntityTransformControls } from "./EntityTransformControls"
import { In } from './components'

export const SidebarTunnel = tunnel()

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
