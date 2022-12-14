import fs from "fs-extra"
import _debug from "debug"
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite"
import { NodePath, transformFromAst, types as t } from "@babel/core"
import gen from "@babel/generator"
import { parse, print } from "@vinxi/recast"
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
          console.log(e)
          throw e
        }
      }
    })

    server.middlewares.use("/__editor/save", async (req, res) => {
      console.log(req.url)
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

        let p = "public/textures/" + req.url.slice(1)
        if (fs.existsSync(p)) {
          fs.removeSync(p)
        }
        console.log(fs.moveSync(files["file"].filepath, p))
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify("/textures/" + req.url.slice(1), null, 2))
      })
    })
  }

  return {
    name: "vite-plugin-vinxi",
    enforce: "pre",
    handleHotUpdate(ctx) {
      console.log(ctx.file)
      if (justEdited[ctx.file]) {
        return []
      }
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
                      t.isJSXAttribute(attr) && (attr.node as any).name.name === prop
                  )

                let value = data.value[prop]

                console.log(value)

                let expr = Array.isArray(value)
                  ? t.jsxExpressionContainer(
                      t.arrayExpression([
                        t.numericLiteral(value[0]),
                        t.numericLiteral(value[1]),
                        t.numericLiteral(value[2])
                      ])
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

  console.log(babelCode, code)
  setTimeout(() => {
    delete justEdited[`${data.source.fileName}`]
  }, 1000)
  fs.writeFileSync(data.source.fileName, code)
}
