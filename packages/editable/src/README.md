# editable

This module contains the primitives to build an editable scene. It allows you to use `editable.div`, `editable.a` or `editable.mesh` (for react-three-fiber) to introduce editable elements in your scene. For other react components, you can use the `Editable` component as such: `<Editable component={MyComponent} {...props} />`.

The editable scene should be wrapped in an `EditorContext.Provider` to provide the editor state and actions to the editable elements.

There is a plugin API for the `Editor` that controls the `icons`, `helpers`, and `controls` that are shown by the editor.

The editor is designed to support the following use cases:

1. Editing native renderer elements (e.g. `div`, `a`, `mesh` for react-three-fiber) props using leva controls, and being able to save the props back to the original JSX source
2. Editing custom react components using leva controls, and being able to save the props back to the original JSX source
3. Providing controls within the rendered scene, eg. `TransformControls` for moving three.js objects around
4. Providing helpers within the rendered scene, eg. `GridHelper` for showing a grid in the scene