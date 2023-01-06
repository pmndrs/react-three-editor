import { EditPatch } from "@editable-jsx/state"
import formidable from "formidable"
import { existsSync } from "fs"
import { moveSync, removeSync } from "fs-extra"
import { resolve } from "path"
import { ViteDevServer } from "vite"
import { createRPCServer } from "vite-dev-rpc"
import { applyPatches } from "../patcher"
import { RpcClientFunctions, RpcServerFunctions, ServerOptions } from "../types"
import { listComponents } from "./components"

const configureMiddlewares = (server: ViteDevServer) => {
  server.middlewares.use("/__editor/save", async (req, res) => {
    let response = await new Promise<string>((resolve, reject) => {
      formidable({
        multiples: true,
        keepExtensions: true,
        filename(name, ext, part, form) {
          return req.url!.slice(1)
        }
      }).parse(req, (err, fields, files) => {
        if (err) {
          reject(err)
        }

        const texturepath = `public/textures/${decodeURIComponent(
          req.url!.slice(1)
        )}`
        if (existsSync(texturepath)) {
          removeSync(texturepath)
        }

        moveSync((files as any)["file"]!.filepath, texturepath)

        resolve(
          JSON.stringify(
            "/textures/" + decodeURIComponent(req.url!.slice(1)),
            null,
            2
          )
        )
      })
    })

    res.setHeader("Content-Type", "application/json")
    res.end(response)
  })
}

export const configureServer = (options: ServerOptions) => {
  return (server: ViteDevServer) => {
    // This is where recieve the changes from the client and apply them to the files
    createRPCServer<RpcClientFunctions, RpcServerFunctions>(
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
          await applyPatches(data)
        },
        async initializeComponentsWatcher() {
          try {
            const componentsDir = resolve(
              process.cwd(),
              "src",
              "components",
              "**/*.{tsx,jsx}"
            )
            return await listComponents(componentsDir)
          } catch (error) {
            console.log("something went wrong while initializing the watcher")
            return []
          }
          // server.watcher.add(componentsDir)
        }
      }
    )

    // This is so that we can expose helper endpoints through which client can work with the fs
    configureMiddlewares(server)
  }
}
