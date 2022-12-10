import {
  applyProps
} from "@react-three/fiber"
import { mergeRefs } from "leva/plugin"
import React, {
  createElement,
  FC,
  forwardRef, useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo
} from "react"
import { Object3D } from "three"
import { EditorContext, SceneElementContext } from "./contexts"
import { EditableElement } from "./editable-element"
import { Elements, ElementType } from './types'
import { useRerender } from './useRerender'

const memo = {} as unknown as Elements

export type EditableProps = {
  component: keyof JSX.IntrinsicElements
}
export const Editable: FC<EditableProps> = ( { component, ...props } ) => {
  const Component = useMemo(() => {
    if (!memo[component]) {
      memo[component] = createEditable(component)
    }
    return memo[component]
  }, [memo, component])
  const isEditor = useContext(EditorContext)
  if (isEditor) {
    return createElement(Component, props)
  }
  return createElement(component as any, props)
}

export function createEditable<K extends keyof JSX.IntrinsicElements, P = {}>(
    componentType: K | React.FC<P>
  ) {
    let hasRef =
      // @ts-ignore
      typeof componentType === "string" ||
      (componentType as any).$$typeof === Symbol.for("react.forward_ref")

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
        editableElement.useEditorStore = useEditorStore!

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

        console.log("render", id, rest, componentType)

        return React.createElement(SceneElementContext.Provider, {
          value: id,
          children: React.createElement(
            componentType as any,
            {
              ...rest,
              ref: mergeRefs([ref, forwardRef])
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
        editableElement.type = componentType as any
        ;(editableElement as any).render = render
        ;(editableElement as any).currentProps = props
        editableElement.source = props._source
        editableElement.useEditorStore = useEditorStore!

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
                    children: e[parentId]?.children.filter(
                      (c: string) => c !== id
                    )
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
            null,
            React.createElement(
              componentType as any,
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
