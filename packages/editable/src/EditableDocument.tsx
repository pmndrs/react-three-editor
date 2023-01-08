import {
  createElement,
  Fragment,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo
} from "react"
import { EditableContext as EditableElementContext } from "./EditableContext"
import { EditableElement } from "./EditableElement"
import { EditableRoot } from "./EditableRoot"

export class EditableDocument extends EditableRoot {
  elements = new Map()
  treeMap = new Map()

  roots = new Set()

  getElementById(id: string): EditableElement | null {
    return this.elements.get(id)
  }

  getElementByTreeId(id: string): EditableElement | null {
    return [...this.elements.values()].find((el) => el.treeId === id)
  }

  createRoot() {
    const root = new EditableRoot()
    root.ownerDocument = this
    this.roots.add(root)
    return root
  }

  /**
   * useElement creates a new Element for the given component type and props and returns the element and the props
   * you need to pass to the component
   * @param Component The component type that we are going to render, it used to detect the name of the component, and can be switched later
   * @param props The props that we are going to pass to the component
   * @param forwardRef true or ref if we want to forward the ref to the component or undefined
   * @returns
   */
  useRoot<T extends EditableRoot = EditableRoot>(
    type = EditableRoot as new (...args: any[]) => T,
    props: any,
    forwardRef?: any
  ): [T, any] {
    const id = this.useId()

    const editableElement = useMemo(() => {
      console.log("creating root", id)
      let root = new type(id, props._source ?? {}, type, props)
      root.ownerDocument = this
      return root
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, id])

    // attaches the render, remount functions and returns a key that
    // need to be passed to the React element to cause remounts
    const {
      key,
      ref,
      moreChildren,
      component: Component
    } = editableElement.useRenderState(forwardRef)

    // update the element with the latest props and source
    editableElement.update(props._source ?? {}, props)

    // see if we have a parent element
    const parent = useContext(EditableElementContext)!

    useLayoutEffect(() => {
      editableElement.ownerDocument.elements.set(id, editableElement)
    }, [editableElement, id])

    useEffect(() => {
      if (!editableElement.deleted) {
        if (parent) {
          parent.appendChild(editableElement)
        } else {
          this.appendChild(editableElement)
        }
      }
      return () => {
        editableElement.ownerDocument.elements.delete(id)
        if (parent) {
          parent.removeChild(editableElement)
        } else {
          this.removeChild(editableElement)
        }
      }
    }, [parent, editableElement, editableElement.deleted])

    return [
      editableElement,
      {
        ...props,
        ...editableElement.props,
        key,
        ref: forwardRef ? ref : undefined,
        children:
          typeof props.children === "function"
            ? props.children
            : createElement(Fragment, null, props.children, moreChildren)
      }
    ]
  }
}
