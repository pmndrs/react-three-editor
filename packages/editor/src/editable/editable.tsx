import { useCreateStore } from "leva"
import { mergeRefs } from "leva/plugin"
import {
  createContext,
  createElement,
  FC,
  forwardRef,
  Fragment,
  Ref,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState
} from "react"
import { EditableElement, JSXSource } from "./EditableElement"
import { EditorContext } from "./Editor"

type Elements = {
  [K in keyof JSX.IntrinsicElements]: FC<
    JSX.IntrinsicElements[K] & {
      ref?: Ref<any>
    }
  >
}

export const EditableElementContext = createContext<EditableElement | null>(
  null
)

const memo = new WeakMap() as unknown as WeakMap<Elements, any> & Elements

export const Editable = forwardRef(
  ({ component, ...props }: { component: any }, ref) => {
    const mainC = useMemo(() => {
      if (!memo.get(component)) {
        memo.set(component, createEditable(component))
      }
      return memo.get(component)
    }, [component])
    const isEditor = useContext(EditorContext)
    if (isEditor) {
      return createElement(mainC, { ...props, ref })
    }
    return createElement(component, { ...props, ref })
  }
)

export function createEditable<K extends keyof JSX.IntrinsicElements, P = {}>(
  Component: any
) {
  let hasRef =
    // @ts-ignore
    typeof Component === "string" ||
    (Component as any).$$typeof === Symbol.for("forward_ref") ||
    ((Component as any).$$typeof === Symbol.for("memo") &&
      Component["type"]?.["$$typeof"] === Symbol.for("forward_ref"))

  if (hasRef) {
    return forwardRef(function Editable(props: any, forwardRef) {
      const { children, ...rest } = props
      let source = props._source
      const editableElement = useEditableElement(Component, source, props)

      let ref = useEditableRef(editableElement)
      editableElement.forwardedRef = true
      const [mounted, setMounted] = useState(false)

      return (
        <EditableElementContext.Provider value={editableElement}>
          <Component
            {...rest}
            {...editableElement.props}
            ref={mergeRefs([ref, forwardRef, (r) => setMounted(true)])}
          >
            {children}
          </Component>
          {mounted && <Helpers />}
        </EditableElementContext.Provider>
      )
    })
  } else {
    return function Editable(props: any) {
      const { children, ...rest } = props
      let source = props._source
      const editableElement = useEditableElement(Component, source, props)
      editableElement.forwardedRef = false

      return (
        <EditableElementContext.Provider value={editableElement}>
          <Component {...rest} {...(editableElement.props ?? {})}>
            {children}
          </Component>
          <Helpers />
        </EditableElementContext.Provider>
      )
    }
  }
}

function useRerender() {
  const [, rerender] = useState(0)
  return useCallback(() => rerender((i) => i + 1), [rerender])
}

function useEditableElement(
  componentType: string | FC,
  source: JSXSource,
  props: any
) {
  const editor = useContext(EditorContext)
  const parent = useContext(EditableElementContext)
  const id = useId()
  const render = useRerender()

  const editableElement = useMemo(() => {
    return new EditableElement(id, source, componentType)
  }, [id])

  const store = useCreateStore()

  editableElement.id = id
  editableElement.parentId = parent?.id
  editableElement.type = componentType
  editableElement.source = source
  editableElement.currentProps = { ...props }
  editableElement.render = render
  editableElement.store = store
  editableElement.editor = editor!

  let memo = editableElement
  let parentId = parent?.id!

  useEffect(() => {
    // editor?.addElement(editableElement, parent)
    // return () => {
    //   editor?.removeElement(editableElement, parent)
    // }
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
            e[parentId].children = e[parentId]?.children.filter(
              (c: string) => c !== id
            )
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

  return editableElement
}

function useEditableRef(editableElement: EditableElement) {
  return (el: any) => {
    if (el) {
      editableElement.setRef(el)
    }
  }
}

function Helpers() {
  const editor = useContext(EditorContext)
  const element = useContext(EditableElementContext)!

  return (
    <>
      {editor?.plugins
        .filter((p) => p.helper && p.applicable(element))
        .map((plugin) => (
          <Fragment key={element.id}>
            <plugin.helper element={element} />
          </Fragment>
        ))}
    </>
  )
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
