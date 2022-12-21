import { r3f } from "@react-three/editor/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    r3f({
      editable: (el) =>
        !(el.type === "primitive") && !(el.type === "namespaced-primitive")
    })
  ]
})
