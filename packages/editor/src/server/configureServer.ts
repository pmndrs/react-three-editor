import { readFileSync, writeFileSync } from "fs"
import { ViteDevServer } from "vite"
import { createRPCServer } from "vite-dev-rpc"
import { configureMiddlewares } from "./middleware"
import { parse, print } from "@vinxi/recast"
import { transformFromAstAsync, types } from "@babel/core"
import { plugins } from "./transform-plugins"

const vinxiBabelParser = require("@vinxi/recast/parsers/babel-ts")
export const configureServer = (server: ViteDevServer) => {
  createRPCServer("vinxi", server.ws, {
    async save(data: any) {
      try {
        if (!data) {
          throw "no data"
        }
        const source = readFileSync(data.source.fileName).toString()
        const sourceAst = parse(source, {
          parser: vinxiBabelParser,
          jsx: true
        } as any)
        await transformFromAstAsync(sourceAst, undefined, {
          cloneInputAst: false,
          filename: data.source.fileName,
          ast: true,
          plugins: plugins(data)
        })
        const code = print(sourceAst, {
          wrapColumn: 1000
        }).code
        writeFileSync(data.source.fileName, code)
      } catch (error) {
        console.log(error)
      }
    }
  })
  configureMiddlewares(server)
}
