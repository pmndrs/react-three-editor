import { defineConfig } from 'vite'
import { r3f } from '@react-three/editor/vite'
import macros from 'babel-plugin-macros'
export default defineConfig({
  plugins: [
    r3f({
      babelPlugins: [macros],
    }),
  ],
})
