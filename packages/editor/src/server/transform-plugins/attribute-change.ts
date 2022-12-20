import { NodePath, PluginItem, types } from "@babel/core"
import template from "@babel/template"
import { filesToSkipOnHmr } from "../filesToSkipOnHmr"

export const attributeMutations = (data: any) => (): PluginItem => {
  const valueExpression = (value: any) => {
    if (typeof value.expression === "string") {
      const templ = template(value.expression)
      const ast = templ({})
      if (types.isExpressionStatement(ast)) {
        return types.jsxExpressionContainer(ast.expression)
      }
    } else if (Array.isArray(value)) {
      return types.jsxExpressionContainer(
        types.arrayExpression(value.map((v) => types.numericLiteral(v)))
      )
    } else if (typeof value === "string") {
      return types.jsxExpressionContainer(types.stringLiteral(value))
    } else if (typeof value === "number") {
      return types.jsxExpressionContainer(types.numericLiteral(value))
    } else if (typeof value === "boolean") {
      return types.jsxExpressionContainer(types.booleanLiteral(value))
    }
  }
  const addAttribute = (
    element: types.JSXOpeningElement,
    path: string,
    expressionContainer: types.JSXExpressionContainer
  ) => {
    const attribute = element.attributes.find((a) => {
      return types.isJSXAttribute(a) && a.name.name === path
    })
    if (attribute) {
      ;(attribute as types.JSXAttribute).value = expressionContainer
    } else {
      element.attributes.push(
        types.jsxAttribute(types.jsxIdentifier(path), expressionContainer)
      )
      filesToSkipOnHmr.set(data.source.fileName, false)
    }
  }

  return {
    visitor: {
      JSXElement: (path: NodePath<types.JSXElement>) => {
        const { action_type, source, value } = data
        if (action_type === "updateAttribute") {
          const { lineNumber, elementName } = source
          const openingElementName =
            types.isJSXIdentifier(path.node.openingElement.name) &&
            path.node.openingElement.name.name
          const nodeLineNumber = path.node.loc?.start.line
          if (
            nodeLineNumber === lineNumber &&
            openingElementName === elementName
          ) {
            Object.entries(data.value).forEach(([propPath, value]) => {
              const expression = valueExpression(value)
              if (expression) {
                addAttribute(path.node.openingElement, propPath, expression)
              }
            })
          }
        }
      }
    }
  }
}
