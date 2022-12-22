import formidable from "formidable"
import { existsSync } from "fs"
import { moveSync, removeSync } from "fs-extra"
import { ViteDevServer } from "vite"

export const configureMiddlewares = (server: ViteDevServer) => {
  server.middlewares.use("/__editor/save", async (req, res) => {
    console.log("saving", req.url)
    let response = await new Promise<string>((resolve, reject) => {
      formidable({
        multiples: true,
        keepExtensions: true,
        filename(name, ext, part, form) {
          return req.url!.slice(1)
        }
      }).parse(req, (err, fields, files) => {
        console.log("here")
        if (err) {
          reject(err)
        }

        const texturepath = `public/textures/${decodeURIComponent(
          req.url!.slice(1)
        )}`
        console.log("here2")
        if (existsSync(texturepath)) {
          removeSync(texturepath)
        }
        console.log("here3")

        moveSync(files["file"]!.filepath, texturepath)
        console.log("here4")

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
    res.write(response)
    res.end()
  })
}
