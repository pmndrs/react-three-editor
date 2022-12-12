import * as THREE from "three"
import { ComponentProps, useState } from "react"
import { applyProps, useFrame, useThree } from "@react-three/fiber"
import { useControls, folder, button, useCreateStore } from "leva"
import { Object3D } from "three"
import { ChangeSource, EditableElement } from "./editable-element"
import { Icon } from "@iconify/react"
import { createRPCClient } from "vite-dev-rpc"
import { createPlugin, useInputContext, Components } from "leva/plugin"
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
import { OrbitControls } from "three-stdlib"

const client = createRPCClient<{
  save: (data: any) => Promise<void>
}>("vinxi", import.meta.hot!, {})

function Collapsible({
  title,
  children,
  collapsed,
  setCollapsed,
  selected,
  hideChevron,
  visible,
  remeasure
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
        remeasure={remeasure}
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
  visible,
  remeasure
}) {
  const context = useInputContext<{ value: { entity: EditableElement } }>()
  const { wrapperRef, contentRef } = useToggle(!collapsed, context.value.entity)
  const ref = React.useRef()

  React.useLayoutEffect(() => {
    if (remeasure) {
      let el = ref.current.parentElement.parentElement.parentElement
      const { height } = contentRef.current!.getBoundingClientRect()
      console.log(el, height)
      if (height > 0) el.style.height = height + 20 + "px"
    }
  }, [context.value.entity])

  return (
    <StyledFolder ref={ref}>
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

function EntityRef({ entity }: { entity: EditableElement }) {
  const [visible, setVisible] = React.useState(entity.ref?.visible)
  return (
    <>
      <EntityTitle entity={entity} visible={visible} setVisible={setVisible} />
    </>
  )
}

export const ref = createPlugin({
  component: () => {
    const context = useInputContext<{ value: EditableElement }>()

    return (
      <Components.Row input>
        <Components.Label>{context.key}</Components.Label>
        <StyledFolder>
          <StyledTitle>
            <EntityRef entity={context.value} key={context.value.id} />
          </StyledTitle>
        </StyledFolder>
      </Components.Row>
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
      remeasure={panel}
      title={<EntityTitle {...{ entity, visible, setVisible }} />}
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
      return {
        ...entity.controls,
        save: button(
          async (get) => {
            // let diffs = [
            //   {
            //     source: entity.source,
            //     value: props
            //   }
            // ]
            let diffs = Object.values(entity.changes).map(
              ({ _source, ...value }) => ({
                value,
                source: _source
              })
            )

            for (var diff of diffs) {
              await client.save(diff)
            }
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
      if (!state) return

      let position = entity.getProp("position", false)
      let edit = false
      if (!eq.array(position, state["transform.position"]?.value)) {
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

function EntityChildren({ entity }) {
  const state = entity.useEditorStore((state) => state.elements)
  console.log(state)

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

function EntityIcon({
  entity,
  ...props
}: { entity: EditableElement } & Omit<ComponentProps<typeof Icon>, "icon">) {
  return (
    <Icon
      icon={
        entity.ref?.isCamera
          ? "ph:video-camera-bold"
          : entity.ref?.isLight
          ? "ph:lightbulb-filament-bold"
          : entity.ref instanceof OrbitControls
          ? "mdi:orbit-variant"
          : "ph:cube"
      }
      onClick={(e) =>
        entity.useEditorStore.setState({
          selected: entity
        })
      }
      {...props}
    />
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
      title={<EntityTitle {...{ entity: child, visible, setVisible }} />}
    >
      <EntityChildren entity={child} />
    </Togglable>
  )
}

function EntityTitle({
  entity,
  visible,
  setVisible
}: {
  entity: EditableElement
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
}) {
  return (
    <>
      <EntityIcon entity={entity} />
      <div
        style={{ marginLeft: "4px" }}
        onClick={(e) =>
          entity.useEditorStore.setState({
            selected: entity
          })
        }
      >
        {entity.displayName}
      </div>
      <div style={{ marginLeft: "auto" }} />
      <StyledIcon
        icon="pepicons-code"
        onClick={(e) =>
          fetch(
            `/__open-in-editor?file=${encodeURIComponent(
              `${entity.source.fileName}:${entity.source.lineNumber}:${
                entity.source.columnNumber + 1
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
          setVisible((v) => !v), (entity.ref.visible = !entity.ref.visible)
        )}
      />
    </>
  )
}

function Togglable(props) {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <Collapsible {...props} collapsed={collapsed} setCollapsed={setCollapsed} />
  )
}
