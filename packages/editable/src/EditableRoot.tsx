import {
  createContext,
  createElement,
  FC,
  Fragment,
  useContext,
  useEffect,
  useId,
  useMemo
} from "react"
import { EditableContext as EditableElementContext } from "./EditableContext"
import { EditableElement } from "./EditableElement"

import { JSXSource } from "@editable-jsx/state"
import { Editor } from "./Editor"
import { Helpers } from "./helpers"
import { IdContext } from "./IdContext"
import { REF_SYMBOL } from "./REF_SYMBOL"

export const EditableRootContext = createContext<EditableRoot>(null)

/**
 * It creates a subsection of the tree that might/might not have a parent but has control over the editing
 * semantics of the tree below it. It decides what constructor will be used to create the elements, and how
 * to render them.
 */
export class EditableRoot<
  T extends EditableElement = EditableElement
> extends EditableElement {
  /**
   * Constructor used to create the editableElement. The default is the EditableElement class
   *
   * Specfic editors can override this to use their own override EditableElement class
   */
  elementConstructor = EditableElement

  editor!: Editor

  constructor(...args) {
    super(...args)
  }

  /**
   * used by the React API to wrap the React element with whatever we need,
   * should be overriden by superclasses to add more wrappers if necessary.
   *
   * this is applied to each and every editableElement in your tree
   *
   * it is not the only way to add things to the tree. You can also use the
   * `helpers` API from the plugins to add helpers to specific types of
   * elements
   */
  renderElement(component: any, props: any, forwardRef: any) {
    const [editableElement, editableProps] = this.useElement(
      component,
      props,
      forwardRef
    )

    if (editableElement.forwardedRef) {
      return (
        <EditableElementContext.Provider value={editableElement}>
          <editableElement.type {...editableProps} />
          {editableElement.mounted && <Helpers />}
        </EditableElementContext.Provider>
      )
    } else {
      return (
        <EditableElementContext.Provider value={editableElement}>
          <editableElement.type {...editableProps} />
          <Helpers />
        </EditableElementContext.Provider>
      )
    }
  }

  createElement(
    id: string,
    source: JSXSource,
    componentType: string | FC,
    props: any
  ): T {
    let element = new this.elementConstructor(
      id,
      source,
      componentType,
      null,
      props
    )

    element.root = this
    return element as any as T
  }

  useId() {
    const idContext = useContext(IdContext)
    const id = useId()
    return idContext ? `${idContext}-${id}` : id
  }

  /**
   * useElement creates a new Element for the given component type and props and returns the element and the props
   * you need to pass to the component
   * @param Component The component type that we are going to render, it used to detect the name of the component, and can be switched later
   * @param props The props that we are going to pass to the component
   * @param forwardRef true or ref if we want to forward the ref to the component or undefined
   * @returns
   */
  useElement(_Component: any, props: any, forwardRef?: any): [T, any] {
    const id = props.id || this.useId()

    const editableElement = useMemo(() => {
      let editableElement = this.createElement(
        id,
        props._source ?? {},
        _Component,
        props
      )
      editableElement.ownerDocument = this.ownerDocument
      return editableElement

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_Component, id])

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

    useEffect(() => {
      editableElement.ownerDocument = this.ownerDocument
      editableElement.ownerDocument.elements.set(id, editableElement)

      if (!editableElement.deleted) {
        if (parent) {
          parent.appendChild(editableElement)
        } else {
          this.appendChild(editableElement)
        }
      }
      return () => {
        editableElement.ownerDocument.elements.delete(id)
        // editableElement.dispose()
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

  findEditableElement(el: any): T | null {
    return el[REF_SYMBOL]
  }

  /***********************************
   *            SETTINGS
   * ********************************/

  // useSettings<S extends Schema>(
  //   name: string,
  //   arg1: S,
  //   hidden?: boolean
  // ): SchemaToValues<S> {
  //   // make sure to rerender when the mode changes
  //   this.useMode()

  //   Settings.useSettingsFolder(this.settings, undefined, {
  //     order: -1,
  //     render: () => this.selectedElement === null,
  //     collapsed: true
  //   })

  //   return Settings.useSettings(this.settings, name, arg1, {
  //     hidden
  //   })
  // }
}
