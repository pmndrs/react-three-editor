import React, {
  ComponentProps,
  forwardRef,
  useCallback,
  useId,
  useEffect,
  useLayoutEffect,
  useMemo,
  useContext
} from "react"
import { folder, levaStore, useControls } from "leva"
import { mergeRefs } from "leva/plugin"
import {
  applyProps,
  Canvas as FiberCanvas,
  useFrame as useFiberFrame
} from "@react-three/fiber"
import { EditorContext, SceneElementContext } from "./contexts"
import { MathUtils, Object3D } from "three"
import { Outs } from "./components"
import { TransformControls } from "three-stdlib"
import { StoreType } from "leva/dist/declarations/src/types"
import { eq } from "./eq"
import { EditorPanel } from "./EditorPanel"
import { createEditorStore, EditorStoreType } from "./stores"


type Elements = {
  [K in keyof JSX.IntrinsicElements]: React.FC<
    JSX.IntrinsicElements[K] & {
      ref?: React.Ref<any>
    }
  >
}

const memo = {} as unknown as Elements

export class EditableElement<P = {}> extends EventTarget {
  children: string[] = []
  props: any = {}
  ref: any | null = null
  dirty: any = false

  store: StoreType | null = null

  transformControls$?: TransformControls
  useEditorStore: EditorStoreType = {} as any
  constructor(
    public id: string,
    public source: {
      fileName: string
      lineNumber: number
      columnNumber: number
      moduleName: string
      componentName: string
    },
    public type: keyof JSX.IntrinsicElements | React.FC<P>,
    public parentId?: string | null
  ) {
    super()
  }

  get key() {
    if (this.source.moduleName === this.source.componentName) {
      return `${this.source.componentName}:${
        typeof this.type === "string"
          ? this.type
          : this.type.displayName || this.type.name
      }:${this.source.lineNumber}:${this.source.columnNumber}`
    }
    return `${this.source.moduleName}:${this.source.componentName}:${
      typeof this.type === "string"
        ? this.type
        : this.type.displayName || this.type.name
    }:${this.source.lineNumber}:${this.source.columnNumber}`
  }

  get name() {
    return this.ref?.name?.length ? this.ref.name : this.key
  }

  get displayName() {
    return this.ref?.name?.length && this.ref.name !== this.key
      ? this.ref.name
      : `${this.source.componentName}:${
          typeof this.type === "string"
            ? this.type
            : this.type.displayName || this.type.name
        }`
  }

  set name(v: string) {
    if (this.ref) {
      this.ref.name = v
    }
  }

  setProp(prop: string, value: any) {
    // this.props[prop] = value
  }

  setTransformFromControls(object: Object3D) {
    this.ref.rotation.copy(object.rotation)
    this.ref.scale.copy(object.scale)
    this.position = object.position.toArray()
    this.setLevaControls({
      "transform.rotation": {
        value: this.rotation
      },
      "transform.scale": {
        value: this.scale
      }
    })
  }

  show() {
    levaStore.setSettingsAtPath(this.name, {
      collapsed: false
    })
  }

  hide() {
    levaStore.setSettingsAtPath(this.name, {
      collapsed: true
    })
  }

  setPositionFromPanel(position: [number, number, number]) {
    this.ref.position.set(...position)
    this.dirty = true
  }

  get position() {
    return this.ref?.position.toArray()
  }

  set position(value) {
    if (eq.array(value, this.position)) {
      return
    }
    // levaStore?.setSettingsAtPath(`scene.` + this.name, {
    //   dirty: true
    // })
    this.dirty = true
    this.ref.position.set(...value)
    this.store?.setValueAtPath("transform.position", value)
    this.store?.setSettingsAtPath("save", { disabled: false })
  }

  get rotation() {
    return [
      MathUtils.radToDeg(this.ref.rotation.x),
      MathUtils.radToDeg(this.ref.rotation.y),
      MathUtils.radToDeg(this.ref.rotation.z)
    ]
  }

  get scale() {
    return this.ref?.scale.toArray()
  }

  setLevaControls(controls: any) {
    if (!this.store) {
      return
    }
    let state = this.store.useStore.getState()

    console.log(state)
    let newControls = {}
    for (let key in controls) {
      let id = `${key}`
      newControls[id] = {
        ...state.data[id],
        ...controls[key]
      }
    }
    console.log(newControls)

    this.store.useStore.setState({
      data: {
        ...state.data,
        ...newControls
      }
    })
  }
}

export function Editable({ component, ...props }) {
  const mainC = useMemo(() => {
    if (!memo[component]) {
      memo[component] = createEditable(component)
    }
    return memo[component]
  }, [memo, component])
  const isEditor = useContext(EditorContext)
  if (isEditor) {
    return React.createElement(mainC, props)
  }
  return React.createElement(component, props)
}

function useRerender() {
  const [, rerender] = React.useState(0)
  return useCallback(() => rerender((i) => i + 1), [rerender])
}

export function createEditable<K extends keyof JSX.IntrinsicElements, P = {}>(
  componentType: K | React.FC<P>
) {
  let hasRef =
    // @ts-ignore
    typeof componentType === "string" ||
    componentType.$$typeof === Symbol.for("react.forward_ref")

  if (hasRef) {
    return forwardRef<
      JSX.IntrinsicElements[K]["ref"],
      JSX.IntrinsicElements[K]
    >(function Editable(
      props: JSX.IntrinsicElements[K]["ref"] & { _source?: any },
      forwardRef
    ) {
      const { children, ...rest } = props
      const useEditorStore = React.useContext(EditorContext)
      const parentId = React.useContext(SceneElementContext)
      const ref = React.useRef()
      const id = useId()

      let source = props._source
      const editableElement = useMemo(() => {
        return new EditableElement<P>(id, source, componentType)
      }, [id])

      editableElement.id = id
      editableElement.parentId = parentId
      editableElement.type = componentType
      editableElement.source = props._source
      editableElement.props = null
      editableElement.useEditorStore = useEditorStore

      useLayoutEffect(() => {
        editableElement.ref = ref.current
      }, [editableElement, ref])

      useEffect(() => {})

      useLayoutEffect(() => {
        useEditorStore?.setState(({ elements }) => {
          if (elements[id] instanceof EditableElement) {
            elements[id] = editableElement
          } else if (elements[id]?.children) {
            elements[id].children.push(id)
            editableElement.children = [...elements[id].children]
            elements[id] = editableElement as EditableElement
          } else {
            elements[id] = editableElement
          }

          if (parentId) {
            if (elements[parentId]) {
              elements[parentId].children.push(id)
            } else {
              elements[parentId] = {
                children: [id]
              } as any
            }
          }
          return {
            elements: {
              ...elements
            }
          }
        })

        return () => {
          useEditorStore?.setState((el) => {
            // Do Cleanup
            // let e = {
            //   ...el.elements
            //   // [parent]: {
            //   //   ...(el.elements[parent] ?? {}),
            //   //   children: el.elements[parent]?.children.filter(
            //   //     (c) => c !== id
            //   //   )
            //   // }
            // }
            // if (el.elements[parentId]) {
            //   el.elements[parentId] = {
            //     ...(el.elements[parentId] ?? {}),
            //     children: e[parentId]?.children.filter((c) => c !== id)
            //   }
            // }
            // delete e[id]
            // return { elements: e }
          })
        }
      }, [parentId, id, editableElement])

      return React.createElement(SceneElementContext.Provider, {
        value: id,
        children: React.createElement(
          componentType,
          {
            ...rest,
            ref: mergeRefs([ref, forwardRef]),
            onPointerDown(e) {
              console.log("click", editableElement)
            }
          },
          children
        )
      })
    })
  } else {
    return function Editable(props) {
      const { children, ...rest } = props
      const useEditorStore = React.useContext(EditorContext)
      const parentId = React.useContext(SceneElementContext)
      const id = useId()
      const render = useRerender()

      const editableElement = useMemo(() => {
        return new EditableElement<P>(id, props._source, componentType)
      }, [id])

      editableElement.id = id
      editableElement.parentId = parentId
      editableElement.type = componentType
      editableElement.render = render
      editableElement.currentProps = props
      editableElement.source = props._source
      editableElement.useEditorStore = useEditorStore

      const memo = editableElement
      // useMemo(
      //   () => ({
      //     id,
      //     children: [],
      //     parent: parentId,
      //     type: key,
      //     props: {},
      //     render
      //   }),
      //   [parentId, key, render]
      // )

      useEffect(() => {
        memo.source = props._source
      }, [props._source, memo])

      useEffect(() => {
        if (props.position || props.rotation || props.scale) {
          memo.ref = new Object3D()
          applyProps(memo.ref, {
            position: props.position,
            rotation: props.rotation,
            scale: props.scale
          })
        }
      }, [])

      useEffect(() => {
        if (parentId) {
          useEditorStore?.setState((el) => ({
            elements: {
              ...el.elements,
              [id]: Object.assign(memo, el.elements[id]),
              [parentId]: Object.assign(el.elements[parentId] ?? {}, {
                children: [...(el.elements[parentId]?.children ?? []), id]
              })
            }
          }))

          return () => {
            useEditorStore?.setState((el) => {
              let e = {
                ...el.elements
                // [parent]: {
                //   ...(el.elements[parent] ?? {}),
                //   children: el.elements[parent]?.children.filter(
                //     (c) => c !== id
                //   )
                // }
              }

              if (e[parentId]) {
                e[parentId] = {
                  ...(el.elements[parentId] ?? {}),
                  children: e[parentId]?.children.filter((c) => c !== id)
                }
              }

              delete e[id]
              return { elements: e }
            })
          }
        } else {
          useEditorStore?.setState((el) => ({
            elements: {
              ...el.elements,
              [id]: Object.assign(memo, el.elements[id])
            }
          }))
          return () => {
            useEditorStore?.setState((el) => {
              let e = { ...el }
              delete e.elements[id]
              return e
            })
          }
        }
      }, [parentId, memo])
      return React.createElement(SceneElementContext.Provider, {
        value: id,
        children: React.createElement(
          "group",
          {
            onPointerDown(e) {
              console.log("click", componentType, memo)
            }
          },
          React.createElement(
            componentType,
            {
              ...rest,
              ...(memo.props ?? {})
            },
            children
          )
        )
      })
    }
  }
}

export const editable = new Proxy(memo, {
  get: <K extends keyof JSX.IntrinsicElements>(target: Elements, key: K) => {
    const value = target[key]
    if (value) {
      return value
    }
    const newValue = createEditable(key)
    target[key] = newValue as any
    return newValue
  }
})

export const Canvas = forwardRef<
  HTMLCanvasElement,
  ComponentProps<typeof FiberCanvas> & { editor?: React.ReactNode }
>(function Canvas(
  { children, editor = React.createElement(EditorPanel), ...props },
  ref
) {
  const store = useMemo(() => createEditorStore(), [])
  return React.createElement(
    React.Fragment,
    {},
    React.createElement(FiberCanvas, {
      ...props,
      ref,
      children: React.createElement(
        EditorContext.Provider,
        {
          value: store
        },
        children,
        editor
      )
    }),
    React.createElement(Outs)
  )
})

export function useFrame(fn, ...args) {
  const loopName = fn.name
  let controls = useControls({
    update: folder({
      [loopName?.length ? loopName : "loop"]: {
        value: true
      }
    })
  })
  return useFiberFrame((...args) => {
    if (controls.loop) {
      fn(...args)
    }
  }, ...args)
}

export { useThree, createPortal } from "@react-three/fiber"

export { SidebarTunnel, EditorPanel } from "./EditorPanel"
