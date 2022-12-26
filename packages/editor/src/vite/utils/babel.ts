import { types } from "@babel/core"

export const getReactComponents = (
  node: types.Statement
):
  | {
      componentName: string
      node: types.ExportDefaultDeclaration | types.ExportNamedDeclaration
    }
  | undefined => {
  if (
    !types.isExportDefaultDeclaration(node) &&
    !types.isExportNamedDeclaration(node)
  )
    return
  let id: types.Identifier | undefined
  let body: types.BlockStatement | boolean = false
  if (types.isFunctionDeclaration(node.declaration) && node.declaration.id) {
    id = node.declaration.id
    body = node.declaration.body
  } else if (
    types.isVariableDeclaration(node.declaration) &&
    node.declaration.declarations.length &&
    types.isVariableDeclarator(node.declaration.declarations[0]) &&
    types.isIdentifier(node.declaration.declarations[0].id)
  ) {
    if (
      types.isArrowFunctionExpression(node.declaration.declarations[0].init) &&
      types.isBlockStatement(node.declaration.declarations[0].init.body)
    ) {
      id = node.declaration.declarations[0].id
      body = node.declaration.declarations[0].init.body
    } else if (
      types.isCallExpression(node.declaration.declarations[0].init) &&
      types.isIdentifier(node.declaration.declarations[0].init.callee) &&
      node.declaration.declarations[0].init.callee.name === "forwardRef"
    ) {
      id = node.declaration.declarations[0].id
      body = true
    }
  }

  if (body && id) {
    if (typeof body === "boolean" && body) {
      return {
        componentName: id.name,
        node
      }
    }

    const isJsx = body.body.some((n) => {
      if (types.isReturnStatement(n)) {
        if (types.isJSXElement(n.argument)) return true
        if (
          types.isParenthesizedExpression(n.argument) &&
          types.isJSXElement(n.argument.expression)
        )
          return true
        return false
      }
    })
    const isHook = body.body.some(
      (n) =>
        types.isExpressionStatement(n) &&
        types.isCallExpression(n.expression) &&
        types.isIdentifier(n.expression.callee) &&
        n.expression.callee.name.startsWith("use")
    )
    console.log(id.name, isJsx, isHook)

    if (isJsx || isHook) {
      return {
        componentName: id.name,
        node
      }
    }
  }
}
