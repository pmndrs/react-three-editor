import { createElement, FC } from "react"
import { Editable, editable } from "./editable"
import { EditableElement } from "./EditableElement"

export class Tree {
  root: EditableElement
  constructor(root: EditableElement) {
    this.root = root
  }

  appendNewElement(
    element: EditableElement,
    componentType: string | FC,
    props: any
  ) {
    console.log("appendNewElement", componentType)
    if (typeof componentType === "string") {
      console.log("appendNewElement", componentType)
      element.refs.setMoreChildren?.((children) => [
        ...children,
        createElement(editable[componentType], {
          _source: {
            ...element.source,
            lineNumber: -1,
            elementName: componentType
          },
          key: children.length,
          ...props
        })
      ])
    } else {
      console.log("appendNewElement", componentType)
      element.refs.setMoreChildren?.((children) => [
        ...children,
        createElement(Editable, {
          component: componentType,
          _source: {
            ...element.source,
            lineNumber: -1,
            elementName:
              componentType.displayName || componentType.name || undefined
          },
          key: children.length,
          ...props
        } as any)
      ])
    }
  }

  deleteElement(element: EditableElement) {
    element.delete()
  }

  appendElement(element: EditableElement, parent: EditableElement | null) {
    let parentId = parent?.id!
    if (parentId) {
      element.parentId = parentId
      this?.store?.setState((el) => {
        let parent = el.elements[parentId] ?? {}
        let newIndex = parent.childIds?.length ?? 0
        element.index = `${newIndex}`
        parent = Object.assign(parent, {
          childIds: [...(el.elements[parentId]?.childIds ?? []), element.id]
        })

        element.index = `${newIndex}`
        let newLement = Object.assign(element, el.elements[element.id])
        return {
          elements: {
            ...el.elements,
            [newLement.id]: newLement,
            [parentId]: parent
          }
        }
      })
    } else {
      if (element.id !== undefined) {
        this?.store?.setState((el) => ({
          elements: {
            ...el.elements,
            [element.id]: Object.assign(element, el.elements[element.id])
          }
        }))
      }
    }
  }

  removeElement(element: EditableElement, parent: EditableElement | null) {
    let parentId = parent?.id!
    if (parentId) {
      element.parentId = null
      this?.store?.setState((el) => {
        let e = {
          ...el.elements
        }

        if (e[parentId]) {
          e[parentId].childIds = e[parentId]?.childIds.filter(
            (c: string) => c !== element.id
          )
        }

        delete e[element.id]
        return { elements: e }
      })
    } else {
      this?.store?.setState((el) => {
        let e = { ...el }
        delete e.elements[element.id]
        return e
      })
    }
  }
}
