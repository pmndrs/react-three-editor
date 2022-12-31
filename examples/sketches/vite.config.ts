import { defineConfig } from 'vite'
import { r3f } from '@react-three/editor/vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [r3f()],
})
