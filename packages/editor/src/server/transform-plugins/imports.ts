import { NodePath, PluginItem, types as t } from "@babel/core"

export const importsPlugin =
  (data: any): PluginItem =>
  () => {
    function getDataImports(_data: any) {
      let imports = Object.values(_data)
        .flatMap((value: any) => {
          if (value.imports) {
            return value.imports
          }
        })
        .filter(Boolean)
      return imports
    }
    return {
      visitor: {
        Program: {
          exit: (path: NodePath<t.Program>, opts: any) => {
            if (!data.value) return
            const imports =
              data.action_type === "insertElement"
                ? data.value.imports
                : getDataImports(data.value)
            imports.forEach(({ importPath, import: _import }: any) => {
              let specifiers: string[] = _import
              if (!Array.isArray(_import)) {
                specifiers = [_import]
              }
              const importDeclaration = path.node.body.find((bodyNode) => {
                return (
                  t.isImportDeclaration(bodyNode) &&
                  bodyNode.source.value === importPath
                )
              }) as t.ImportDeclaration | undefined
              if (importDeclaration) {
                specifiers.forEach((specifier) => {
                  const existingIdentifier = importDeclaration.specifiers.find(
                    (s) => {
                      return (
                        t.isImportSpecifier(s) &&
                        t.isIdentifier(s.imported) &&
                        s.imported.name === specifier
                      )
                    }
                  )
                  if (!existingIdentifier) {
                    importDeclaration.specifiers.push(
                      t.importSpecifier(
                        t.identifier(specifier),
                        t.identifier(specifier)
                      )
                    )
                  }
                })
              } else {
                path.node.body.unshift(
                  t.importDeclaration(
                    [
                      ...specifiers.map((s) =>
                        t.importSpecifier(t.identifier(s), t.identifier(s))
                      )
                    ],
                    t.stringLiteral(importPath)
                  )
                )
              }
            })
          }
        }
      }
    }
  }
