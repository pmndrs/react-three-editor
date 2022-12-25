import { transformFromAstAsync, parseAsync, types } from "@babel/core"
import { parse, prettyPrint } from "@vinxi/recast"
import { parse as babelParse, parser } from "@vinxi/recast/parsers/babel-ts"
import { readFile, writeFile } from "fs-extra"
import { ViteDevServer } from "vite"
import { createRPCServer } from "vite-dev-rpc"
import { EditPatch } from "../../types"
import { filesToSkipOnHmr } from "./filesToSkipOnHmr"
import { configureMiddlewares } from "./middlewares"
import { plugins } from "./transform-plugins"
import { RpcClientFunctions, RpcServerFunctions, ServerOptions } from "../types"
import { resolve } from "path"
import glob from "fast-glob"
import { getReactComponents } from "../utils"

const groupPatchesByFileName = (patches: EditPatch[]) => {
  return patches.reduce((accum, x) => {
    ;(accum[x.source.fileName] = accum[x.source.fileName] || []).push(x)
    return accum
  }, {} as Record<string, EditPatch[]>)
}

const applyPatches = async (fileName: string, patches: EditPatch[]) => {
  const source = await readFile(fileName)
  const sourceAst = parse(source.toString(), {
    parser: { parser, parse: babelParse },
    jsx: true
  } as any)
  filesToSkipOnHmr.set(fileName, { skip: true, timeout: 0 })
  await transformFromAstAsync(sourceAst, undefined, {
    cloneInputAst: false,
    filename: fileName,
    ast: true,
    plugins: plugins(patches)
  })
  const code = prettyPrint(sourceAst, {
    wrapColumn: 1000
  }).code

  filesToSkipOnHmr.get(fileName)!.timeout = setTimeout(() => {
    if (filesToSkipOnHmr.get(fileName)?.timeout) {
      filesToSkipOnHmr.get(fileName)!.skip = false
    }
  }, 1000)

  await writeFile(fileName, code)
}

export const configureServer = (options: ServerOptions) => {
  return (server: ViteDevServer) => {
    // This is where recieve the changes from the client and apply them to the files
    const rpc = createRPCServer<RpcClientFunctions, RpcServerFunctions>(
      "react-three-editor",
      server.ws,
      {
        async save(data: EditPatch | EditPatch[]) {
          if (!data) {
            throw new Error(`no data`)
          }
          if (!Array.isArray(data)) {
            data = [data]
          }
          const grouped = groupPatchesByFileName(data as EditPatch[])
          await Promise.all(
            Object.entries(grouped).map(async ([fileName, patches]) => {
              return applyPatches(fileName, patches).catch((err) => {
                console.log(
                  `Something went wrong while applying patches to ${fileName}`
                )
                console.error(err)
              })
            })
          )
        },
        async initializeComponentsWatcher() {
          const componentsDir = resolve(
            process.cwd(),
            "src",
            "__reactThreeEditor",
            "**/*.{tsx,jsx}"
          )
          const componentFiles = await glob(componentsDir, {
            cwd: process.cwd()
          })
          const files = await Promise.all(
            componentFiles.map(async (fileName) => {
              try {
                const source = await readFile(fileName)
                const sourceAst = parse(source.toString(), {
                  parser: { parser, parse: babelParse },
                  jsx: true
                } as any)
                const program = sourceAst.program as types.Program
                const components = program.body
                  .map((node) => {
                    const compo = getReactComponents(node)
                    if (compo) {
                      return compo.componentName
                    }
                  })
                  .filter(Boolean) as string[]
                return {
                  fileName,
                  components
                }
              } catch (error) {
                console.log("something went wring while parsing the file")
                return {
                  fileName,
                  components: []
                }
              }
            })
          )
          return files.filter((f) => f.components.length)
          // server.watcher.add(componentsDir)
        }
      }
    )

    // This is so that we can expose helper endpoints through which client can work with the fs
    configureMiddlewares(server)
  }
}
