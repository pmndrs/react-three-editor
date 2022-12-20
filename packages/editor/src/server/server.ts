import { NodePath, transformFromAst, types as t } from "@babel/core"
import gen from "@babel/generator"
import template from "@babel/template"
import { parse, print } from "@vinxi/recast"
import fs from "fs-extra"
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite"
import { createRPCServer } from "vite-dev-rpc"

let justEdited: Record<string, boolean> = {}

export default function editor(): Plugin {
  let config: ResolvedConfig
  function configureServer(server: ViteDevServer) {
    createRPCServer("vinxi", server.ws, {
      save(data: any) {
        try {
          transform(data)
        } catch (e) {
          throw e
        }
      }
    })

    server.middlewares.use("/__editor/save", async (req, res) => {
      const { default: formidable, errors } = await import("formidable")
      formidable({
        multiples: true,
        keepExtensions: true,
        filename: req.url.slice(1)
      }).parse(req, (err, fields, files) => {
        if (err) {
          // example to check for a very specific error
          if (err.code === errors.maxFieldsExceeded) {
          }
          res.writeHead(err.httpCode || 400, { "Content-Type": "text/plain" })
          res.end(String(err))
          return
        }

        let p = `public/${fields.type}s/` + decodeURIComponent(req.url.slice(1))
        if (fs.existsSync(p)) {
          fs.removeSync(p)
        }
        fs.moveSync(files["file"].filepath, p)
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(
          JSON.stringify(
            `/${fields.type}s/` + decodeURIComponent(req.url.slice(1)),
            null,
            2
          )
        )
      })
    })
  }

  return {
    name: "vite-plugin-vinxi",
    enforce: "pre",
    handleHotUpdate(ctx) {
      if (justEdited[ctx.file]) {
        return []
      }
    },
    transformIndexHtml: async (id, prop) => {
      return [
        {
          tag: "link",
          attrs: {
            type: "text/css",
            rel: "stylesheet",
            href: "node_modules/@react-three/editor/assets/style.css"
          }
        }
      ]
    },
    configResolved(_config) {
      config = _config
    },
    configureServer
  }
}

function transform(data: any) {
  if (!data) throw "no data"
  let source = fs.readFileSync(data.source.fileName).toString()

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

  const ast2 = parse(source, {
    parser: require("@vinxi/recast/parsers/babel-ts"),
    jsx: true
  } as any)

  transformFromAst(ast2, undefined, {
    // @ts-ignore
    cloneInputAst: false,
    filename: data.source.fileName,
    ast: true,
    plugins: [
      () => {
        return {
          visitor: {
            Program: (path: NodePath<t.Program>, opts: any) => {
              const imports = getDataImports(data.value)
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
            },
            JSXOpeningElement: (path: NodePath<t.JSXOpeningElement>) => {
              if (
                path.node?.loc?.start.line === data.source.lineNumber &&
                path.node?.loc?.start.column === data.source.columnNumber - 1
              ) {
                justEdited[data.source.fileName] = true
                Object.keys(data.value).forEach((v) => {
                  addAttribute(v)
                })
              }

              function addAttribute(prop: any) {
                let attr = path
                  .get("attributes")
                  .find(
                    (attr) =>
                      t.isJSXAttribute(attr) &&
                      (attr.node as any).name.name === prop
                  )

                let value = data.value[prop]
                let expr: any
                if (typeof value.expression === "string") {
                  const templ = template(value.expression)
                  const ast = templ({})
                  if (t.isExpressionStatement(ast)) {
                    expr = t.jsxExpressionContainer(ast.expression)
                  }
                } else {
                  expr = Array.isArray(value)
                    ? t.jsxExpressionContainer(
                        t.arrayExpression(value.map((v) => t.numericLiteral(v)))
                      )
                    : typeof value === "object"
                    ? t.jsxExpressionContainer(
                        t.callExpression(t.identifier("useLoader"), [
                          t.identifier("TextureLoader"),
                          t.stringLiteral(value.src)
                        ])
                      )
                    : typeof value === "string"
                    ? t.jsxExpressionContainer(t.stringLiteral(value))
                    : typeof value === "number"
                    ? t.jsxExpressionContainer(t.numericLiteral(value))
                    : t.jsxExpressionContainer(t.booleanLiteral(value))
                }

                if (expr) {
                  if (attr) {
                    attr.set("value", expr)
                  } else {
                    justEdited[data.source.fileName] = false
                    path.node.attributes.push(
                      t.jsxAttribute(t.jsxIdentifier(prop), expr)
                    )
                  }
                }
              }
            }
            // JSXAttribute: (attr: NodePath<t.JSXAttribute>) => {
            //   const element = attr.parentPath
            //   function addAttribute(attr, prop, value) {
            //     let expr = Array.isArray(value)
            //       ? t.jsxExpressionContainer(
            //           t.arrayExpression([
            //             t.numericLiteral(value[0]),
            //             t.numericLiteral(value[1]),
            //             t.numericLiteral(value[2])
            //           ])
            //         )
            //       : t.jsxExpressionContainer(t.booleanLiteral(value))
            //     if (attr) {
            //       let sourceLocation = attr.node.value
            //       expr.loc = sourceLocation.loc
            //       expr.start = sourceLocation.start
            //       expr.end = sourceLocation.end
            //       console.log(
            //         attr.node.value.expression.elements[0].value,
            //         value[0]
            //       )
            //       attr.node.value.expression.elements[0].value =
            //         value[0]
            //       // attr.get("value").replaceWith(expr)
            //       // attr
            //       //   .get("value")
            //       //   .get("expression")
            //       //   .get("elements")?.[0].node.value = value[0]
            //     } else {
            //       // path
            //       // path.node.attributes.push(
            //       //   t.jsxAttribute(t.jsxIdentifier(prop), expr)
            //       // )
            //     }
            //   }
            //   if (
            //     element.node.loc.start.line ===
            //       data.source.lineNumber &&
            //     element.node.loc.start.column ===
            //       data.source.columnNumber - 1 &&
            //     Object.keys(data.value).includes(attr.node.name.name)
            //   ) {
            //     addAttribute(
            //       attr,
            //       attr.node.name.name,
            //       data.value[attr.node.name.name]
            //     )
            //   }
            // }
          }
        }
      }
    ]
  })

  let babelCode = gen(ast2).code
  let code = print(ast2, {
    wrapColumn: 1000
  }).code

  setTimeout(() => {
    delete justEdited[`${data.source.fileName}`]
  }, 1000)
  fs.writeFileSync(data.source.fileName, code)
}
