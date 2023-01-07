import type { types as t } from "@babel/core"

export type JSXElementType =
  | {
      type: "primitive"
      node: t.JSXIdentifier
      openingElement: t.JSXOpeningElement
      name: string
      fileName: string
    }
  | {
      type: "component"
      node: t.JSXIdentifier
      openingElement: t.JSXOpeningElement
      name: string
      fileName: string
    }
  | {
      type: "namespaced-component"
      node: t.JSXIdentifier
      openingElement: t.JSXOpeningElement
      namespace: string
      name: string
      fileName: string
    }
  | {
      type: "namespaced-primitive"
      node: t.JSXIdentifier
      openingElement: t.JSXOpeningElement
      namespace: string
      name: string
      fileName: string
    }
