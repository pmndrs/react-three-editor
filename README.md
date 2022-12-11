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

later it will only require a plugin in your build chain

```jsx
import { defineConfig } from "vite"
import { r3f } from "@react-three/editor/vite"

export default defineConfig({
  plugins: [r3f()],
})
```
