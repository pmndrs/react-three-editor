# react-three-editor
🔌 A one of a kind scene editor that writes changes back into your code

https://twitter.com/nkSaraf98/status/1597140836654804994

https://twitter.com/itsdouges/status/1597178413449904129

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
