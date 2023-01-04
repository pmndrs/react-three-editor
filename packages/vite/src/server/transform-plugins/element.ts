import { NodePath, PluginItem, types } from "@babel/core"
import { EditPatch } from "../../../types"

type ElementMutationValue = {
  selectionAsChild: boolean
  componentType: string
}

export const elementMutations = (
  patches: EditPatch<ElementMutationValue>[]
) => {
  return (): PluginItem => {
    return {
      visitor: {
        JSXElement: (path: NodePath<types.JSXElement>) => {
          patches.forEach((patch) => {
            const { action_type, source, value } = patch
            const { lineNumber, elementName } = source
            const { selectionAsChild, componentType } = value || {}
            const openingElementName =
              types.isJSXIdentifier(path.node.openingElement.name) &&
              path.node.openingElement.name.name
            const nodeLineNumber = path.node.loc?.start.line
            if (
              nodeLineNumber === lineNumber &&
              openingElementName === elementName
            ) {
              if (action_type === "insertElement") {
                const newJSXElement = types.jsxElement(
                  types.jsxOpeningElement(types.jsxIdentifier(componentType), [
                    types.jsxAttribute(
                      types.jsxIdentifier("name"),
                      types.stringLiteral(componentType)
                    )
                  ]),
                  types.jsxClosingElement(types.jsxIdentifier(componentType)),
                  []
                )
                if (selectionAsChild) {
                  const parent = types.isJSXElement(path.parent) && path.parent
                  if (parent) {
                    const index = parent.children.indexOf(path.node)
                    if (index > -1) {
                      const clonedNode = types.cloneNode(path.node)
                      newJSXElement.children.push(clonedNode)
                      parent.children.splice(index, 1, newJSXElement)
                    }
                  }
                } else {
                  path.node.children.push(newJSXElement)
                }
              } else if (action_type === "deleteElement") {
                const parent = types.isJSXElement(path.parent) && path.parent
                if (parent) {
                  const index = parent.children.indexOf(path.node)
                  if (index > -1) {
                    parent.children.splice(index, 1)
                  }
                }
              }
            }
          })
        }
      }
    }
  }
}
