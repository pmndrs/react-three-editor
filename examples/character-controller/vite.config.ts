import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { r3f } from '@react-three/editor/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: 'build',
  },
  plugins: [r3f(), tsconfigPaths()],
});
