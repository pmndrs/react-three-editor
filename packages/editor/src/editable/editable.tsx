import {
  createContext,
  createElement,
  FC,
  forwardRef,
  Fragment,
  ReactNode,
  Ref,
  useContext,
  useEffect,
  useMemo
} from "react"
import { EditableElement } from "./EditableElement"
import { EditorContext, useEditorStore } from "./Editor"

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

export const setEditable = (
  component: any,
  editable: (props: any) => ReactNode
) => {
  memo.set(component, editable)
}

export const Editable = forwardRef(
  ({ component, ...props }: { component: any }, ref) => {
    const isEditor = useContext(EditorContext)
    const mainC = useMemo(() => {
      if (!memo.get(component) && isEditor) {
        memo.set(component, createEditable(component))
      }
      return memo.get(component)
    }, [component, isEditor])
    if (isEditor) {
      return createElement(mainC, { ...props, ref })
    }
    return createElement(component, { ...props, ref })
  }
)

import { useHelper } from "@react-three/drei"
import { applyProps } from "@react-three/fiber"
import { BoxHelper, Group } from "three"
import { helpers } from "./controls/helpers"

export function BoundsHelper({
  editableElement: element,
  props,
  children
}: {
  editableElement: EditableElement
  props: any
  children: ReactNode
}) {
  const item = useMemo(() => new Group(), [])

  // @ts-ignore
  element.bounds = item

  const [{ bounds }] = element.editor.useSettings("helpers", {
    ["bounds"]: helpers({
      label: "bounds"
    })
  })

  const isSelected = useEditorStore((state) => state.selectedId === element.id)

  let ref =
    bounds === "all"
      ? { current: item }
      : bounds === "selected" && isSelected
      ? { current: item }
      : undefined

  useHelper(ref, BoxHelper)

  useEffect(() => {
    if (props.position || props.rotation || props.scale) {
      applyProps(item as unknown as any, {
        position: props.position,
        rotation: props.rotation,
        scale: props.scale
      })
    }
  }, [item])

  return <primitive object={item}>{children}</primitive>
}

export function createEditable<K extends keyof JSX.IntrinsicElements, P = {}>(
  Component: any
) {
  let hasRef =
    // @ts-ignore
    typeof Component === "string" ||
    (Component as any).$$typeof === Symbol.for("react.forward_ref") ||
    ((Component as any).$$typeof === Symbol.for("react.memo") &&
      Component["type"]?.["$$typeof"] === Symbol.for("react.forward_ref"))

  if (hasRef) {
    return forwardRef(function Editable(props: any, forwardRef) {
      const editor = useContext(EditorContext)
      if (!editor) return <Component {...props} ref={forwardRef} />

      const [editableElement, overrideProps] = editor.useElement(
        Component,
        props,
        forwardRef ?? true
      )

      return (
        <EditableElementContext.Provider value={editableElement}>
          {createElement(Component, overrideProps)}
          {editableElement.mounted && <Helpers />}
        </EditableElementContext.Provider>
      )
    })
  } else {
    return function Editable(props: any) {
      const editor = useContext(EditorContext)
      if (!editor) return <Component {...props} ref={forwardRef} />

      const [editableElement, overrideProps] = editor.useElement(
        Component,
        props
      )

      return (
        <EditableElementContext.Provider value={editableElement}>
          <BoundsHelper props={{}} editableElement={editableElement}>
            {createElement(Component, overrideProps)}
            <Helpers />
          </BoundsHelper>
        </EditableElementContext.Provider>
      )
    }
  }
}

function useEditableContext() {
  const editableElement = useContext(EditableElementContext)
  if (!editableElement) {
    throw new Error("useEditableContext must be used within an Editable")
  }
  return editableElement
}

function Helpers() {
  const element = useEditableContext()

  return (
    <>
      {element.editor?.plugins
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
