import { ViteDevServer } from "vite"
import { createRPCServer } from "vite-dev-rpc"
import { configureMiddlewares } from "./middlewares"
import { EditPatch } from "../../types"
import { readFile, writeFile } from "fs-extra"
import { prettyPrint, parse } from "@vinxi/recast"
import vinxiBabelParser from "@vinxi/recast/parsers/babel-ts"
import { transformFromAstAsync } from "@babel/core"
import { plugins } from "./transform-plugins"

const groupPatchesByFileName = (patches: EditPatch[]) => {
  return patches.reduce((accum, x) => {
    ;(accum[x.source.fileName] = accum[x.source.fileName] || []).push(x)
    return accum
  }, {} as Record<string, EditPatch[]>)
}

const applyPatches = async (fileName: string, patches: EditPatch[]) => {
  const source = await readFile(fileName)
  const sourceAst = parse(source.toString(), {
    parser: vinxiBabelParser,
    jsx: true
  } as any)
  await transformFromAstAsync(sourceAst, undefined, {
    cloneInputAst: false,
    filename: fileName,
    ast: true,
    plugins: plugins(patches)
  })
  const code = prettyPrint(sourceAst, {
    wrapColumn: 1000
  }).code
  await writeFile(fileName, code)
}

export const configureServer = (server: ViteDevServer) => {
  // This is where recieve the changes from the client and apply them to the files
  createRPCServer("react-three-editor", server.ws, {
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
    }
  })

  // This is so that we can expose helper endpoints through which client can work with the fs
  configureMiddlewares(server)
}
