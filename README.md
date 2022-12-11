# react-three-editor

🔌 A one of a kind scene editor that writes changes back into your code

## Alpha

Requirements: Using `@react-three/fiber` and `vite`

```bash
npm install @react-three/editor -D
```

https://twitter.com/nkSaraf98/status/1597140836654804994

https://twitter.com/itsdouges/status/1597178413449904129


Go to your `vite.config.js` file and add the following:

```js
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { r3f } from "@react-three/editor/vite"

export default defineConfig((env) => ({
  plugins: [env.command === 'build' ? react() : r3f()],
}))
```

And voila!

You should have an editor in your app that writes changes back into your code.

Run 
```bash
npm run dev
```

and open `localhost:5173` to play with your scene.

You don't have to change anything in your scene, it will just work.

```jsx
import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere } from '@react-three/drei'

export const App = () => (
  <Canvas camera={{ fov: 45, position: [-4, 2, -4] }}>
    <Sparkles position={[1, 1, 1]} />
    <OrbitControls makeDefault />
    <mesh position={[6.948, -2.158, 0.465]}>
      <boxBufferGeometry attach="geometry" />
      <meshStandardMaterial attach="material" color="red" />
    </mesh>
    <directionalLight position={[4.224, 1.912, 3.046]} />
    <ambientLight />
    <Sphere position={[8.817, 1.557, 5.818]} />
  </Canvas>
)
```

![Screenshot 2022-12-10 at 9 11 07 PM](https://user-images.githubusercontent.com/11255148/206888078-d062c942-07f8-4ce4-9bd6-023115e83146.png)

By default, the editor will add some recongnized native elements, and React components that have transform-related props, eg. `position`, `rotation`, `scale` or a `name` prop. This way we can avoid the noise of having to show the whole React component tree (You have the devtools for that..).

Please provide feedback about your experience. We are trying to learn what will be helpful.

### Development 

to test out this repo you need pnpm

```bash
npm install -g pnpm
```

then just open a tab and run

```bash
pnpm install
pnpm run dev
```

open another

```bash
cd examples/[any example you want]
pnpm run dev
```
