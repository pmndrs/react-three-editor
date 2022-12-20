import { ViteDevServer } from "vite"
import formidable from "formidable"
import { existsSync } from "fs"
import { moveSync, removeSync } from "fs-extra"

export const configureMiddlewares = (server: ViteDevServer) => {
  server.middlewares.use("/__editor/save", async (req, res) => {
    return new Promise<string>((resolve, reject) => {
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

        moveSync(files["file"]!.filepath, texturepath)

        resolve(
          JSON.stringify(
            "/textures/" + decodeURIComponent(req.url!.slice(1)),
            null,
            2
          )
        )
      })
    })
  })
}
