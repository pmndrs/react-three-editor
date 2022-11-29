import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { vite as editor, babel as editorBabel } from "@react-three/editor"

export default defineConfig({
  plugins: [
    editor(),
    react({
      babel: {
        plugins: [editorBabel]
      }
    })
  ]
})
