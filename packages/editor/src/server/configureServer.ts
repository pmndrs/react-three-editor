import { transformFromAstAsync } from "@babel/core"
import { parse, print } from "@vinxi/recast"
import { readFileSync } from "fs"
import { writeFile } from "fs-extra"
import { ViteDevServer } from "vite"
import { createRPCServer } from "vite-dev-rpc"
import { configureMiddlewares } from "./middleware"
import { plugins } from "./transform-plugins"

const vinxiBabelParser = require("@vinxi/recast/parsers/babel-ts")
export const configureServer =
  (filesToSkipOnHmr: Map<string, boolean>) => (server: ViteDevServer) => {
    createRPCServer("vinxi", server.ws, {
      async save(data: any) {
        try {
          if (!data) {
            throw "no data"
          }
          const fileName = data.source.fileName
          const source = readFileSync(fileName).toString()
          if (!["insertElement", "deleteElement"].includes(data.action_type)) {
            filesToSkipOnHmr.set(fileName, true)
          }
          const sourceAst = parse(source, {
            parser: vinxiBabelParser,
            jsx: true
          } as any)
          await transformFromAstAsync(sourceAst, undefined, {
            cloneInputAst: false,
            filename: fileName,
            ast: true,
            plugins: plugins(data)
          })
          const code = print(sourceAst, {
            wrapColumn: 1000
          }).code
          await writeFile(fileName, code)
          setTimeout(() => {
            filesToSkipOnHmr.delete(fileName)
          }, 1000)
        } catch (error) {
          console.log(error)
        }
      }
    })
    configureMiddlewares(server)
  }
