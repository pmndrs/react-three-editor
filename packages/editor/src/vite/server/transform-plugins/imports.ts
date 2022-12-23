import { NodePath, PluginItem, types as t } from "@babel/core"
import { EditPatch } from "../../../types"

const getDataImports = (_data: any) => {
  let imports = Object.values(_data)
    .flatMap((value: any) => {
      if (value.imports) {
        return value.imports
      }
    })
    .filter(Boolean)
  return imports
}

export type PatchImport = {
  import: string | string[]
  importPath: string
}
export type ImportPatchValue = {
  imports: PatchImport[]
}
export const importsPlugin = (
  patches: EditPatch<ImportPatchValue>[]
): PluginItem => {
  return () => {
    return {
      visitor: {
        Program: {
          exit: (path: NodePath<t.Program>, opts: any) => {
            patches.forEach((patch) => {
              if (!patch.value) return
              const imports =
                patch.action_type === "insertElement"
                  ? patch.value.imports ?? []
                  : getDataImports(patch.value)

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
                    const existingIdentifier =
                      importDeclaration.specifiers.find((s) => {
                        return (
                          t.isImportSpecifier(s) &&
                          t.isIdentifier(s.imported) &&
                          s.imported.name === specifier
                        )
                      })
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
            })
          }
        }
      }
    }
  }
}
