import * as THREE from "three"
import { memo, useState } from "react"
import { applyProps, useFrame, useThree } from "@react-three/fiber"
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
import { useEditor } from "./useEditor"
import { ChangeSource, EditableElement } from "./editable-element"
import { Icon } from "@iconify/react"
import { createRPCClient } from "vite-dev-rpc"
import { createPlugin, useInputContext } from "leva/plugin"
import React from "react"
import { LevaPanel } from "leva"
import { eq } from "./eq"
import { useToggle } from "./folder/Folder/useToggle"
import {
  StyledContent,
  StyledFolder,
  StyledTitle,
  StyledIcon,
  StyledWrapper
} from "./folder/Folder/StyledFolder"
import { Chevron } from "./folder/Folder/Chevron"

const client = createRPCClient<{
  save: (data: any) => Promise<void>
}>("vinxi", import.meta.hot!, {})

const getControls = (entity: EditableElement) => {
  let controls = {}
  if (entity.ref instanceof Object3D) {
    Object.assign(controls, {
      transform: folder(
        {
          position: {
            lock: true,
            step: 0.1,
            value: entity.getProp("position", true),
            // disabled: true,

            onChange: (value, path, context) => {
              console.log(entity.store?.getData())
              if (!value || !context.fromPanel || context.initial) {
                return
              }
              entity.setProp("position", value, ChangeSource.Leva)
            }
          }
          // rotation: {
          //   lock: true,
          //   step: 1,
          //   value: entity.rotation,

          //   onChange: (value) => {
          //     if (!value) {
          //       return
          //     }

          //     value = value.map((v) =>
          //       typeof v === "string" ? Number(v.substring(0, v.length - 1)) : v
          //     )

          //     let rad = value.map((v) => MathUtils.degToRad(v))
          //     let euler = [...rad, "XYZ"]

          //     if (!eq.array(rad, entity.ref.rotation.toArray())) {
          //       entity.ref.rotation.fromArray(euler)
          //     }

          //     entity.transformControls$?.object?.rotation.fromArray(euler)

          //     if (entity.props) {
          //       entity.props.rotation = rad
          //       entity.render()
          //     }
          //   }
          // },
          // scale: {
          //   lock: true,
          //   step: 0.1,
          //   type: LevaInputs.VECTOR3D,
          //   value: entity.scale,
          //   onChange: (value) => {
          //     if (!value) {
          //       return
          //     }
          //     if (typeof entity.ref?.__r3f?.memoizedProps.scale === "number") {
          //       console.log(entity.ref.__r3f.memoizedProps.scale)
          //       // levaStore.useStore.setState(({ data }) => ({
          //       //   data: {
          //       //     ...data,
          //       //     [`${entity.name}.transform.scale`]: {
          //       //       ...data[`${entity.name}.transform.scale`],
          //       //       locked: true
          //       //     }
          //       //   }
          //       // }))
          //       // levaStore.setSettingsAtPath(`${entity.name}.transform.scale`, {
          //       //   locked: true
          //       // })
          //       console.log(levaStore.useStore.getState())
          //     }
          //     entity.ref.scale.fromArray(value)
          //     entity.transformControls$?.object?.scale.fromArray(value)
          //     if (entity.props) {
          //       entity.props.scale = value
          //       entity.render()
          //     }
          //   }
          // }
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

  if (entity.ref?.isDirectionalLight) {
    Object.assign(controls, {
      color: {
        value: entity.ref.color.getStyle(),
        onChange(v) {
          entity.ref.color.setStyle(v)
          // entity.render()
        }
      },
      intensity: {
        value: entity.ref.intensity,
        onChange(v, path, context) {
          if (context.initial) {
            return
          }
          console.log(entity.ref, v, path, context)
          applyProps(entity.ref, {
            memoized: entity.ref.__r3f.memoizedProps,
            changes: [["intensity", v, false, []]]
          })
          // entity.set('intensity', v)
          // entity.render()
        }
      }
    })
  }

  return controls
}

// const savedProps = (get, entity: EditableElement) => {
//   if (entity.ref instanceof Object3D) {
//     const store = entity.store!.useStore.getState()
//     return {
//       position: !eq.array(store.data[`transform.position`].value, [0, 0, 0])
//         ? store.data[`transform.position`].value.map((v) =>
//             Number(v.toFixed(3))
//           )
//         : undefined
//       // rotation: !eq.array(store.data[`transform.rotation`].value, [0, 0, 0])
//       //   ? store.data[`transform.rotation`].value.map((i) =>
//       //       MathUtils.degToRad(i)
//       //     )
//       //   : undefined,
//       // scale: !eq.array(store.data[`transform.scale`].value, [1, 1, 1])
//       //   ? store.data[`transform.scale`].value
//       //   : undefined

//       // scale: get(`${entity.name}.transform.scale`),
//       // rotation: get(`${entity.name}.transform.rotation`).map((i) =>
//       //   MathUtils.degToRad(i)
//       // )
//     }
//   } else if (entity.ref?.isMaterial) {
//     return {
//       wireframe: get(`${entity.name}.material.wireframe`)
//     }
//   }
// }

function Collapsible({
  title,
  children,
  collapsed,
  setCollapsed,
  selected,
  hideChevron,
  visible
}) {
  if (hideChevron) {
    return (
      <StyledFolder>
        <StyledTitle selected={selected} visible={visible}>
          <Chevron
            hidden={hideChevron}
            onClick={() => setCollapsed((e) => !e)}
            toggled={!collapsed}
          />
          <div style={{ marginLeft: "2px" }} />
          {title}
        </StyledTitle>
      </StyledFolder>
    )
  } else {
    return (
      <SceneEntity
        title={title}
        children={children}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selected={selected}
        hideChevron={hideChevron}
        visible={visible}
      />
    )
  }
}

function SceneEntity({
  title,
  children,
  collapsed,
  setCollapsed,
  selected,
  hideChevron,
  visible
}) {
  const context = useInputContext<{ value: { entity: EditableElement } }>()
  const { wrapperRef, contentRef } = useToggle(!collapsed)

  return (
    <StyledFolder>
      <StyledTitle selected={selected} visible={visible}>
        <Chevron
          hidden={hideChevron}
          onClick={() => setCollapsed((e) => !e)}
          toggled={!collapsed}
        />
        <div style={{ marginLeft: "2px" }} />
        {title}
      </StyledTitle>
      <StyledWrapper ref={wrapperRef} isRoot={false} fill={true} flat={true}>
        <StyledContent ref={contentRef} isRoot={false} toggled={!collapsed}>
          <div>{children}</div>
        </StyledContent>
      </StyledWrapper>
    </StyledFolder>
  )
}

export const entityPanel = createPlugin({
  normalize(input) {
    return {
      value: { entity: input.entity },
      settings: {
        collapsed: false,
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

    return (
      <EntityControl
        entity={context.value.entity}
        key={context.value.entity.id}
        collapsed={context.settings.collapsed}
        setCollapsed={setCollapsed}
        showChildren={context.settings.children}
        dirty={context.settings.dirty}
        panel={context.settings.panel}
      />
    )
  }
})
export const EntityEditor = ({ entity }: { entity: EditableElement }) => {
  if (entity.store) {
    return <EntityStoreable entity={entity} />
  } else {
    return <StoreableEntity entity={entity} />
  }
}

export function EntityControl({
  collapsed,
  onCollapse,
  entity,
  showChildren,
  dirty,
  panel
}: {
  collapsed: boolean
  onCollapse?: (c: boolean) => void
  entity: EditableElement
  showChildren?: boolean
  dirty?: boolean
  panel?: boolean
}) {
  const selected = entity.useEditorStore((s) => s.selected === entity)
  const [_collapsed, setCollapsed] = useState(collapsed)
  const [visible, setVisible] = useState(entity.ref.visible)
  return (
    <Collapsible
      collapsed={_collapsed}
      setCollapsed={(c) => {
        onCollapse?.(c)
        setCollapsed(c)
      }}
      visible={visible}
      selected={selected}
      hideChevron={showChildren && entity.children.length === 0}
      title={
        <>
          <Icon
            icon={
              entity.ref?.isCamera
                ? "ph:video-camera-bold"
                : entity.ref?.isLight
                ? "ph:lightbulb-filament-bold"
                : "ph:cube"
            }
            onClick={(e) =>
              entity.useEditorStore.setState({
                selected: entity
              })
            }
          />
          <div
            style={{ marginLeft: "2px" }}
            onClick={(e) =>
              entity.useEditorStore.setState({
                selected: entity
              })
            }
          >
            {entity.displayName}
            {dirty ? "*" : ""}
          </div>
          <div
            style={{
              marginLeft: "auto"
            }}
          ></div>
          <StyledIcon
            icon="pepicons-code"
            onClick={(e) => {
              console.log(entity)
              fetch(
                `/__open-in-editor?file=${encodeURIComponent(
                  `${entity.source.fileName}:${entity.source.lineNumber}:${
                    entity.source.columnNumber + 1
                  }`
                )}`
              )
            }}
          />
          <StyledIcon
            icon={visible ? "ph:eye-bold" : "ph:eye-closed-bold"}
            style={{
              marginLeft: 2
            }}
            onClick={(e) => (
              setVisible((v) => !v), (entity.ref.visible = !entity.ref.visible)
            )}
          />
        </>
      }
    >
      {!_collapsed && showChildren && <EntityChildren entity={entity} />}
      {panel && (
        <LevaPanel
          fill
          titleBar={false}
          flat
          // collapsed={{
          //   collapsed: context.settings.collapsed,
          //   onChange(e) {
          //     setCollapsed(e)
          //   }
          // }}
          hideCopyButton
          theme={{
            space: {
              rowGap: "2px",
              md: "6px",
              sm: "4px"
            }
          }}
          store={entity.store}
        />
      )}
    </Collapsible>
  )
}

function StoreableEntity({ entity }: { entity: EditableElement }) {
  const entityStore = useCreateStore()
  entity.store = entityStore
  return <EntityStoreable entity={entity} />
}

function EntityStoreable({ entity }: { entity: EditableElement }) {
  const scene = useThree((s) => s.scene)
  const [run, setRun] = useState(0)
  function reset() {
    setRun((r) => r + 1)
  }
  let entityStore = entity.store!
  const [, set] = useControls(
    () => {
      let controls = getControls(entity)
      return {
        ...controls,
        save: button(
          async (get) => {
            let props = entity.store?.getData()["save"].settings.changed
            let diffs = [
              {
                source: entity.source,
                value: props
              }
            ]
            await client.save(diffs[0])
            entity.store?.setSettingsAtPath("save", { disabled: true })
          },
          {
            disabled: !entity.dirty
          }
        )
      }
    },
    {
      store: entityStore
    },
    [entity, run]
  )

  useFrame(function editorControlsSystem() {
    if (entity.ref && entity.ref instanceof THREE.Object3D) {
      let state = entity.store?.getData()

      let position = entity.getProp("position", false)
      let edit = false
      if (!eq.array(position, state["transform.position"].value)) {
        state["transform.position"].disabled = true
        state["transform.position"].value = position
        edit = true
      }

      // let rotation = entity.rotation
      // id = "transform.rotation"
      // el = state[id]
      // if (!eq.angles(rotation, el.value)) {
      //   newState[id] = {
      //     ...state[id],
      //     disabled: true,
      //     value: rotation
      //   }
      //   edit = true
      // }

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
        console.log("reading", position)
        entity.store?.useStore.setState({
          data: state
        })
      }
    }
  })

  return null
}

export function EntityTree({ entity }) {
  useControls(
    {
      scene: folder({
        [entity.name]: entityPanel({
          entity,
          panel: false,
          collapsed: false,
          children: true
        })
      })
    },
    {
      order: 1000,
      collapsed: false
    }
  )

  return null
}

function EntityChildren({ entity }) {
  const state = entity.useEditorStore((state) => state.elements)

  return (
    <div
      style={{
        marginLeft: "2px",
        marginTop: "2px"
      }}
    >
      {entity.children
        .filter((c) => c !== entity.id)
        .map((c) => (
          <EntityChild child={state[c]} key={c} />
        ))}
    </div>
  )
}

function EntityChild({ child }: { child: EditableElement }) {
  // const visible = child.store.useStore((d) => d.data.visible)
  const [visible, setVisible] = useState(child.ref.visible)
  return (
    <Togglable
      hideChevron={child.children.length === 0}
      selected={child.useEditorStore((state) => state.selected) === child}
      visible={visible}
      title={
        <>
          <Icon
            icon={
              child.ref?.isCamera
                ? "ph:video-camera-bold"
                : child.ref?.isLight
                ? "ph:lightbulb-filament-bold"
                : "ph:cube"
            }
            onClick={(e) =>
              child.useEditorStore.setState({
                selected: child
              })
            }
          />
          <div
            style={{ marginLeft: "4px" }}
            onClick={(e) =>
              child.useEditorStore.setState({
                selected: child
              })
            }
          >
            {child.displayName}
          </div>
          <div style={{ marginLeft: "auto" }} />
          <StyledIcon
            icon="pepicons-code"
            onClick={(e) =>
              fetch(
                `/__open-in-editor?file=${encodeURIComponent(
                  `${child.source.fileName}:${child.source.lineNumber}:${
                    child.source.columnNumber + 1
                  }`
                )}`
              )
            }
          />
          <StyledIcon
            icon={visible ? "ph:eye-bold" : "ph:eye-closed-bold"}
            style={{
              marginLeft: 2
            }}
            onClick={(e) => (
              setVisible((v) => !v), (child.ref.visible = !child.ref.visible)
            )}
          />
        </>
      }
    >
      <EntityChildren entity={child} />
    </Togglable>
  )
}

function Togglable(props) {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <Collapsible {...props} collapsed={collapsed} setCollapsed={setCollapsed} />
  )
}
