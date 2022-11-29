import * as THREE from "three"
import { memo, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import {
  useControls,
  folder,
  useStoreContext,
  button,
  levaStore,
  LevaInputs,
  useCreateStore
} from "leva"
import { MathUtils, Object3D } from "three"
import { EditableElement, useEditor } from "."
import { Icon } from "@iconify/react"
import { createRPCClient } from "vite-dev-rpc"
import { createPlugin, useInputContext } from "leva/plugin"
import React from "react"
import { LevaPanel } from "leva"
import { eq } from "./eq"

const client = createRPCClient("vinxi", import.meta.hot, {})

window.leva = levaStore
const getControls = (entity: EditableElement) => {
  let controls = {}
  if (entity.ref instanceof Object3D) {
    Object.assign(controls, {
      transform: folder(
        {
          position: {
            lock: true,
            step: 0.1,
            value: entity.ref.position.toArray(),

            onChange: (value, path, context) => {
              // if (value && context.fromPanel) {
              //   entity.setPositionFromPanel(value)
              // }
              if (!value) {
                return null
              }

              console.log(value, path, context)
              if (!eq.array(value, entity.ref.position.toArray())) {
                entity.ref.position.fromArray(value)
              }
              // @ts-ignore
              entity.transformControls$?.object?.position.fromArray(value)
              if (entity.props) {
                entity.props.position = value
                entity.render()
              }
            }
          },
          rotation: {
            lock: true,
            step: 1,
            value: entity.rotation,

            onChange: (value) => {
              if (!value) {
                return
              }

              value = value.map((v) =>
                typeof v === "string" ? Number(v.substring(0, v.length - 1)) : v
              )

              let rad = value.map((v) => MathUtils.degToRad(v))
              let euler = [...rad, "XYZ"]

              if (!eq.array(rad, entity.ref.rotation.toArray())) {
                entity.ref.rotation.fromArray(euler)
              }

              entity.transformControls$?.object?.rotation.fromArray(euler)

              if (entity.props) {
                entity.props.rotation = rad
                entity.render()
              }
            }
          },
          scale: {
            lock: true,
            step: 0.1,
            type: LevaInputs.VECTOR3D,
            value: entity.scale,
            onChange: (value) => {
              if (!value) {
                return
              }
              if (typeof entity.ref?.__r3f?.memoizedProps.scale === "number") {
                console.log(entity.ref.__r3f.memoizedProps.scale)
                // levaStore.useStore.setState(({ data }) => ({
                //   data: {
                //     ...data,
                //     [`${entity.name}.transform.scale`]: {
                //       ...data[`${entity.name}.transform.scale`],
                //       locked: true
                //     }
                //   }
                // }))
                levaStore.setSettingsAtPath(`${entity.name}.transform.scale`, {
                  locked: true
                })
                console.log(levaStore.useStore.getState())
              }
              entity.ref.scale.fromArray(value)
              entity.transformControls$?.object?.scale.fromArray(value)
              if (entity.props) {
                entity.props.scale = value
                entity.render()
              }
            }
          }
        },
        {
          collapsed: false
        }
      )
    })
  } else if (entity.ref?.isMaterial) {
    Object.assign(controls, {
      material: folder({
        wireframe: {
          value: entity.ref.wireframe,
          onChange(v) {
            entity.ref.wireframe = v
            // entity.render()
          }
        },
        color: {
          value: entity.ref.color.getStyle(),
          onChange(v) {
            entity.ref.color.setStyle(v)
            // entity.render()
          }
        }
      })
    })
  }

  return controls
}

const savedProps = (get, entity: any) => {
  if (entity.ref instanceof Object3D) {
    const store = levaStore.useStore.getState()
    return {
      position: !eq.array(
        store.data[`${entity.name}.transform.position`].value,
        [0, 0, 0]
      )
        ? store.data[`${entity.name}.transform.position`].value.map((v) =>
            Number(v.toFixed(3))
          )
        : undefined,
      rotation: !eq.array(
        store.data[`${entity.name}.transform.rotation`].value,
        [0, 0, 0]
      )
        ? store.data[`${entity.name}.transform.rotation`].value.map((i) =>
            MathUtils.degToRad(i)
          )
        : undefined,
      scale: !eq.array(
        store.data[`${entity.name}.transform.scale`].value,
        [1, 1, 1]
      )
        ? store.data[`${entity.name}.transform.scale`].value
        : undefined

      // scale: get(`${entity.name}.transform.scale`),
      // rotation: get(`${entity.name}.transform.rotation`).map((i) =>
      //   MathUtils.degToRad(i)
      // )
    }
  } else if (entity.ref?.isMaterial) {
    return {
      wireframe: get(`${entity.name}.material.wireframe`)
    }
  }
}

const entityPanel = createPlugin({
  normalize(input) {
    return {
      value: { entity: input.entity },
      settings: {
        collapsed: true,
        dirty: false,
        ...input
      }
    }
  },
  component: (props) => {
    const context = useInputContext<{ value: { entity: EditableElement } }>()

    function setCollapsed() {
      context.setSettings({
        collapsed: !context.settings.collapsed
      })
    }

    const state = context.value.entity.useEditorStore((state) => state.elements)

    return (
      <div>
        <div
          style={{
            display: "flex",
            marginTop: "4px",
            flexDirection: "row",
            alignItems: "center",
            color: context.settings.collapsed
              ? "var(--leva-colors-highlight1)"
              : "var(--leva-colors-highlight3)",
            cursor: "pointer"
          }}
          onClick={() => setCollapsed((e) => !e)}
        >
          <Icon icon="ph:cube" />
          <div style={{ marginLeft: "4px" }}>
            {context.value.entity.name}
            {context.settings.dirty ? "*" : ""}
          </div>
        </div>
        <EntityChildren entity={context.value.entity} />
        <form>
          <LevaPanel
            fill
            titleBar={false}
            flat
            collapsed={{
              collapsed: context.settings.collapsed,
              onChange(e) {
                setCollapsed(e)
              }
            }}
            hideCopyButton
            theme={{
              space: {
                rowGap: "2px",
                md: "6px",
                sm: "4px"
              }
            }}
            store={context.value.entity.store}
          />
        </form>
      </div>
    )
  }
})
export const EntityEditor = ({ entity }: { entity: EditableElement }) => {
  console.log(entity)
  const scene = useThree((s) => s.scene)
  const [run, setRun] = useState(0)
  function reset() {
    setRun((r) => r + 1)
  }
  const state = useEditor((state) => state.elements)

  const entityStore = useCreateStore()
  entity.store = entityStore
  const [, set] = useControls(
    () => {
      let name = entity.name
      let controls = getControls(entity)
      entity.controls = controls
      return {
        name: folder(
          {
            name: {
              value: name,
              onChange: (value) => {
                entity.name = value
              }
            }
          },
          {
            collapsed: true
          }
        ),
        [entity.name + "-visible"]: {
          type: LevaInputs.BOOLEAN,
          value: entity.ref.visible,
          label: "visible",
          onChange: (value) => {
            console.log(entity.ref)
            // entity.setProp("visible", value)
            entity.ref.visible = value
          }
        },

        ...controls,
        save: button(
          (get) => {
            let props = savedProps(get, entity)
            let diffs = [
              {
                source: entity.source,
                // value: Object.fromEntries(
                //   Object.entries(props).filter(([key, value]) => entity.dirty[key])
                // )
                value: props
              }
            ]
            // fetch("/__editor/write", {
            //   method: "POST",
            //   headers: {
            //     "Content-Type": "application/json"
            //   },
            //   body: JSON.stringify(diffs)
            // })
            client.save(diffs[0])
          },
          {
            disabled: true
          }
        )
      }
    },
    {
      store: entityStore
    },
    [entity, run]
  )

  useControls(
    {
      [entity.name]: entityPanel({
        entity
      })
    },
    {
      order: 1000,
      collapsed: true
    }
  )

  useFrame(function editorControlsSystem() {
    if (entity.ref && entity.ref instanceof THREE.Object3D) {
      let state = entity.store?.getData()

      let position = entity.position
      let id = "transform.position"
      let el = state[id]

      let newState = {}
      let edit = false
      if (!eq.array(position, el.value)) {
        newState[id] = {
          ...state[id],
          disabled: true,
          value: position
        }
        edit = true
      }

      let rotation = entity.rotation
      id = "transform.rotation"
      el = state[id]
      if (!eq.angles(rotation, el.value)) {
        newState[id] = {
          ...state[id],
          disabled: true,
          value: rotation
        }
        edit = true
      }

      // let scale = entity.scale
      // id = entity.name + ".transform.scale"
      // el = state.data[id]
      // if (!eq.array(scale, el.value)) {
      //   newState[id] = {
      //     ...state.data[id],
      //     disabled: true,
      //     value: scale
      //   }
      //   edit = true
      // }

      if (edit) {
        entity.store?.useStore.setState({
          data: {
            ...state,
            ...newState
          }
        })
      }
    }
  })

  return null
}
function EntityChildren({ entity }) {
  const state = entity.useEditorStore((state) => state.elements)
  const context = useInputContext<{ value: { entity: EditableElement } }>()

  console.log(state)
  return (
    <div
      style={{
        marginLeft: "8px"
      }}
    >
      {entity.children
        .filter((c) => c !== entity.id)
        .map((c) => (
          <>
            <div
              key={c}
              style={{
                display: "flex",
                marginTop: "4px",
                flexDirection: "row",
                alignItems: "center",
                color: context.settings.collapsed
                  ? "var(--leva-colors-highlight1)"
                  : "var(--leva-colors-highlight3)",
                cursor: "pointer"
              }}
              onClick={() => setCollapsed((e) => !e)}
            >
              <Icon icon="ph:cube" />
              <div style={{ marginLeft: "4px" }}>
                {state[c].name}
                {context.settings.dirty ? "*" : ""}
              </div>
            </div>
            <EntityChildren entity={state[c]} />
          </>
        ))}
    </div>
  )
}
