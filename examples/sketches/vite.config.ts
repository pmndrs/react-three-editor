import { defineConfig } from 'vite'
import { r3f } from '@react-three/editor/vite'
import reacts from '@vitejs/plugin-react'
import viteImagemin from 'vite-plugin-imagemin'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        r3f(),
        viteImagemin({
            pngquant: {
                quality: [0.8, 0.9],
                speed: 4,
            },
        }),
    ],
})
