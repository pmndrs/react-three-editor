# react-three-editor

🔌 A one of a kind scene editor that writes changes back into your code, and you don't need to change your code at all for it to to work!

![Screenshot 2022-12-17 at 6 22 09 AM](https://user-images.githubusercontent.com/11255148/208272078-d50d1514-469a-4ff1-8f9c-2e0c8e8ae4db.png)

https://twitter.com/nkSaraf98/status/1597140836654804994

https://twitter.com/itsdouges/status/1597178413449904129

## Installation (Alpha):

Requirements: Using `@react-three/fiber` and `vite`

```bash
npm install @react-three/editor -D
```


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
import { OrbitControls, Sphere, Sparkles } from '@react-three/drei'

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

### How it works?

1. We need to know what the UI tree for the app. This represents the mental model that the user has. So we use the React component tree as a model for that. Unlike the React devtools, we usually only want the components in user code only, not library code. The user should get to work with higher and higher level abstractions where they are available (just like Reavt). And library code is not in their control anyway, so they can't edit it.

There is some cost to adding this editing-related state to React elements that we need. The more elements we show, the more noise in the tree that the user is editing. So we should aim to be able to get the 'useful' elements that represent the UI tree. It's difficult.

Right now our approach is follows:

To pick up what elements should be editable, we use a code transform to change user code only to include annotations for what elements are editable. By default, we will turn all the elements in the file to editable.

```tsx

// Before
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

// After
export const App = () => (
  <Editable component={Canvas} camera={{ fov: 45, position: [-4, 2, -4] }}>
    <Editable component={Sparkles} position={[1, 1, 1]} />
    <Editable component={OrbitControls} makeDefault />
    <editable.mesh position={[6.948, -2.158, 0.465]}>
      <editable.boxBufferGeometry attach="geometry" />
      <editable.meshStandardMaterial attach="material" color="red" />
    </editable.mesh>
    <editable.directionalLight position={[4.224, 1.912, 3.046]} />
    <editable.ambientLight />
    <Editable component={Sphere} position={[8.817, 1.557, 5.818]} />
  </Editable>
)
```

This also means that if someone's not using the transform they can do this annotation by hand. The user can configure the transform to decide if they want to ignore certain components from the tree, 

eg.

```tsx
export default defineConfig({
  plugins: [r3f({ editable: (element) => element.type !== 'mesh' })]
})
```

This can be used to filter out all primitives, or certain specific library components. Since its a function you can use any pattern for filtering things out, like regex, lists, etc.

2. The other information we need from this transform is the actual source code location of all the elements that we mark as editable. So another part of the transform is adding the `_source` prop to each editable JSX element. 

```tsx

// After
export const App = () => (
  <editable.mesh position={[6.948, -2.158, 0.465]} _source={{fileName:"",columnNumber:"",lineNumber:""}}>
    <editable.boxBufferGeometry attach="geometry" _source={{fileName:"",columnNumber:"",lineNumber:""}}/>
    <editable.meshStandardMaterial attach="material" color="red" _source={{fileName:"",columnNumber:"",lineNumber:""}} />
  </editable.mesh>
)
```

3. Once we know what elements are editable, and where they are, our editor is ready to go! This is where the client picks up.

We have a very thin user API. Our aim is to work with a user's codebase without any changes. So we don't want to add any new dependencies, or change the way they write their code. We want to be able to work with any React app, and any React component library. 

On the client, we keep track of a tree of React editable elements. This is visualized by the scene tree in the editor. The elements are represented by the class `EditableElement`. This is analagous to the DOM Element class. 

While most React apps are just the DOM, the kind we are dealing with have some DOM and mostly react-three-fiber code under a `Canvas` component. React itself doesn't recognize this whole tree as one. It treats the tree upto the Canvas as one, and the tree another the Canvas as another completely opaque and independent tree. While this suits their implementation, for us it makes sense to treat the app (across different React renderers) as one tree. We have a class called `EditableDocument` (analogous to DOM `Document` class) that keeps track of this tree and provides operations to modify it. So how do we handle these multiple React renderers? We have a thing called `EditableRoot` that represents a special node in the tree that tells us that under that tree, we might be dealing with a specific type of elements. So we have these classes for the various roots we have `EditableDOMRoot`, `EditableThreeRoot`, `EditableRemotionRoot`, etc. More can be created for specific renderers easily. While most elements are okay being represented by `EditableElement` any root can use its specifc overriden version, eg. `EditableThreeElement` to add specific functionality or override things from the original class.

What does the `EditableElement` class deal with:
- Current props from the user app
- Tracks the ref
- Children provided by the user app
- Props overriden in the editor
- Children (added/removed) in the editor
- Hooks to remount, rerender a component
- Able to delete the component from the rendered tree, while keeping a reference in the EditableTree
- Gives the element a name using hueristics
- `get controls()` that uses the registered plugins to figure out the `leva` schema for any specific component
- `properties` store to keep track of active leva controls that are being shown (this store is cleared up when the element is not selected and being edited in the panel)


5. Saving changes. So now that the user can play with the app and tweak properties and move things around, they want to save their changes. For this we actually write their changes back to the source code. The client remembers all the elements that have had changes of any type (prop change, inserted child, added wrapper, etc.)

The user can save an element individually, or all together. The changes are sent as json patches back to our dev server (more about this later). The dev server's job is to take the patches, figure out the file to apply them to, load the current code and send it to our `patcher` to patch witht the changes. The patched code is then written back to the file.

Right now we have found that `ts-morph` is probably the best solution for this patching. Its excellent at keeping the structure from the original source code including any styling weirdness. So we can most reliably control how the positions of the exisiting JSX elements are changing. This is important, because if we know that none of the elements are moving around because of a prop change, we can skip HMR. We have already applied the change on the client in realtime when the user edited, we don't need another HMR to get that same change. HMR is unpredictable and not as good an experience as actual just realtime editing. 

Saying that, most big set of changes would probably need HMR if it involves elements moving around in the file, so we make sure we don't break on HMR. Not only do we not want to break, we want to actually pick up changes you might have made yourself, and show them in the properties panel. So basically HMRing the properties panel too.
