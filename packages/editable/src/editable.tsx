import { FC, forwardRef, ReactNode, Ref, useContext, useMemo } from "react"
import { EditorContext } from "./EditorContext"

type Elements = {
  [K in keyof JSX.IntrinsicElements]: FC<
    JSX.IntrinsicElements[K] & {
      ref?: Ref<any>
    }
  >
}

const memo = new WeakMap() as unknown as WeakMap<Elements, any> & Elements

export const setEditable = (
  component: any,
  editable: (props: any) => ReactNode
) => {
  if (typeof component === "string") {
    // @ts-ignore
    memo[component] = editable
  } else if (typeof component === "symbol") {
    // @ts-ignore
    memo[component] = editable
  } else {
    memo.set(component, editable)
  }
}

export const getEditable = (component: any) => {
  if (typeof component === "string") {
    // @ts-ignore
    return memo[component]
  } else if (typeof component === "symbol") {
    // @ts-ignore
    return memo[component]
  } else {
    return memo.get(component)
  }
}

export const Editable = forwardRef(
  ({ component, ...props }: { component: any }, ref) => {
    const editor = useContext(EditorContext)
    const EditableComponent = useMemo(() => {
      if (editor) {
        if (component.$$typeof === Symbol.for("react.provider")) {
          return component
        }

        if (!getEditable(component) && editor) {
          setEditable(component, createEditable(component))
        }
        return getEditable(component)
      }
      return component
    }, [component, editor])

    return <EditableComponent {...props} ref={ref} />
  }
)

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

      return editor.renderElement(Component, props, forwardRef ?? true)
    })
  } else {
    return function Editable(props: any) {
      const editor = useContext(EditorContext)
      if (!editor) return <Component {...props} />

      return editor.renderElement(Component, props, false)
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
