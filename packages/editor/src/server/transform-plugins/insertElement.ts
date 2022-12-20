import { NodePath, PluginItem, types } from "@babel/core"

export const insertElement = (data: any) => (): PluginItem => {
  return {
    visitor: {
      JSXElement: (path: NodePath<types.JSXElement>) => {
        const { action_type, source, value } = data
        if (action_type === "insertElement") {
          const { lineNumber, elementName } = source
          const { selectionAsChild, componentType } = value
          const openingElementName =
            types.isJSXIdentifier(path.node.openingElement.name) &&
            path.node.openingElement.name.name
          const nodeLineNumber = path.node.loc?.start.line
          if (
            nodeLineNumber === lineNumber &&
            openingElementName === elementName
          ) {
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
            }
          }
        }
      }
    }
  }
}
