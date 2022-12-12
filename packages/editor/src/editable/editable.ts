import { applyProps } from "@react-three/fiber"
import { useCreateStore } from "leva"
import { mergeRefs } from "leva/plugin"
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo
} from "react"
import { Object3D } from "three"
import { EditorContext, EditableElementContext } from "./contexts"
import { EditableElement } from "./EditableElement"
import { Instance } from "@react-three/fiber/dist/declarations/src/core/renderer"

type Elements = {
  [K in keyof JSX.IntrinsicElements]: React.FC<
    JSX.IntrinsicElements[K] & {
      ref?: React.Ref<any>
    }
  >
}
const memo = new WeakMap() as unknown as WeakMap<Elements, any> & Elements

export const Editable = forwardRef(({ component, ...props }, ref) => {
  const mainC = useMemo(() => {
    if (!memo.get(component)) {
      memo.set(component, createEditable(component))
    }
    return memo.get(component)
  }, [component])
  const isEditor = useContext(EditorContext)
  if (isEditor) {
    return React.createElement(mainC, { ...props, ref })
  }
  return React.createElement(component, { ...props, ref })
})
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
    (componentType as any).$$typeof === Symbol.for("react.forward_ref")

  if (hasRef) {
    return forwardRef(function Editable(props: any, forwardRef) {
      const { children, ...rest } = props
      const editor = React.useContext(EditorContext)
      const parent = React.useContext(EditableElementContext)
      const ref = React.useRef()
      const id = useId()

      let source = props._source
      const editableElement = useMemo(() => {
        return new EditableElement(id, source, componentType)
      }, [id])

      const store = useCreateStore()

      editableElement.id = id
      editableElement.parentId = parent?.id
      editableElement.type = componentType
      editableElement.source = props._source
      editableElement.currentProps = props
      editableElement.props = null
      editableElement.store = store
      editableElement.editor = editor!

      useLayoutEffect(() => {
        editableElement.ref = ref.current
        if (editableElement.ref.__r3f) {
          editableElement.ref.__r3f.editable = editableElement
        }
      }, [editableElement, ref])

      useEffect(() => {})

      let parentId = parent?.id

      useLayoutEffect(() => {
        editor?.store?.setState(({ elements }) => {
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
          editor?.store?.setState((el) => {
            // Do Cleanup
            let e = {
              ...el.elements
            }
            delete e[id]
            return { elements: e }
          })
        }
      }, [parentId, id, editableElement])

      console.log("render", id, rest, componentType, forwardRef)

      return React.createElement(EditableElementContext.Provider, {
        value: editableElement,
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
    return function Editable(props: any) {
      const { children, ...rest } = props
      const editor = React.useContext(EditorContext)
      const parent = React.useContext(EditableElementContext)
      const id = useId()
      const render = useRerender()

      const editableElement = useMemo(() => {
        return new EditableElement(id, props._source, componentType)
      }, [id])
      const store = useCreateStore()

      editableElement.id = id
      editableElement.parentId = parent?.id
      editableElement.type = componentType as any
      editableElement.render = render
      editableElement.currentProps = props
      editableElement.store = store
      editableElement.source = props._source
      editableElement.editor = editor!

      const memo = editableElement
      const item = useMemo(() => new Object3D(), [])

      useEffect(() => {
        if (props.position || props.rotation || props.scale) {
          memo.ref = item
          applyProps(item as unknown as Instance, {
            position: props.position,
            rotation: props.rotation,
            scale: props.scale
          })
        }
      }, [item])

      let parentId = parent?.id
      useEffect(() => {
        if (parentId) {
          editor?.store?.setState((el) => ({
            elements: {
              ...el.elements,
              [id]: Object.assign(memo, el.elements[id]),
              [parentId]: Object.assign(el.elements[parentId] ?? {}, {
                children: [...(el.elements[parentId]?.children ?? []), id]
              })
            }
          }))

          return () => {
            editor?.store?.setState((el) => {
              let e = {
                ...el.elements
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
          editor?.store?.setState((el) => ({
            elements: {
              ...el.elements,
              [id]: Object.assign(memo, el.elements[id])
            }
          }))
          return () => {
            editor?.store?.setState((el) => {
              let e = { ...el }
              delete e.elements[id]
              return e
            })
          }
        }
      }, [parent?.id, memo])
      return React.createElement(
        EditableElementContext.Provider,
        {
          value: editableElement
        },
        React.createElement("primitive", { object: item }),
        React.createElement(
          componentType as any,
          {
            ...rest,
            ...(memo.props ?? {})
          },
          children
        )
      )
    }
  }
}

export const editable = new Proxy(memo, {
  get: (target: any, key: any) => {
    const value = target[key]
    if (value) {
      return value
    }
    const newValue = createEditable(key)
    target[key] = newValue as any
    return newValue
  }
})
