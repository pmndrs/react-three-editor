import { useEditor } from "@editable-jsx/editable"
import { Bounds } from "@react-three/drei"
import { useDrag } from "leva/plugin"
import { Suspense, useEffect, useState } from "react"
import { suspend } from "suspend-react"
import { ComponentType } from "../component-loader"
import { editor } from "./editor"
import { Screenshot, useScreenshotStore } from "./useScreenshotStore"

const getComponent = async (path, name) => {
  // use import to get the React component from path
  const component = await import(path)
  return component[name]
}
// function LoadComponent({ component }) {
//   const Component = suspend(async () => {
//     return getComponent(component.importPath, component.name)
//   }, [component.importPath, component.name])

//   useEffect(() => {
//     useScreenshotStore.setState((s) => {
//       s.previews[component.importPath + component.name].readyForPreview = true
//       return { ...s }
//     })
//     // return () => {
//     // }
//   }, [])
//   return <Component />
// }
function ComponentScreenshot({
  component,
  ...props
}: {
  component: ComponentType
}) {
  const [id] = useState(
    () => component.importPath + component.name + Math.random()
  )

  const Component = suspend(async () => {
    return getComponent(component.importPath, component.name)
  }, [component.importPath, component.name])

  console.log(id)
  const editor = useEditor()
  const bind = useDrag(
    (state) => {
      if (state.first) {
        editor.send("START_ADDING", {
          state: {
            movement: state.movement
          }
        })
      } else if (state.last) {
        editor.send("STOP_DRAGGING", {
          state: {
            movement: state.movement,
            xy: state.xy,
            elementId: id,
            componentType: Component
          }
        })
      } else {
        editor.send("DRAGGING", {
          state: {
            movement: state.movement,
            xy: state.xy
          }
        })
      }
    },
    {
      preventDefault: true
    }
  )
  return (
    <Screenshot
      id={component.importPath + component.name}
      {...bind()}
      {...props}
    >
      <Suspense>
        <Bounds
          fit
          clip
          damping={0}
          margin={2}
          observe
          onFit={() => {}}
          key={component.importPath + component.name}
        >
          <Component />
        </Bounds>
      </Suspense>
    </Screenshot>
  )
}
export function ComponentsTray() {
  const components = editor.loader.store((s) => s.components)

  useEffect(() => {
    setTimeout(() => {
      useScreenshotStore.getState().screenshot()
    }, 500)
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: "50%",
        zIndex: 1000,
        transform: "translateX(-50%)"
      }}
    >
      {components.map((c) => (
        <Suspense key={c.importPath + c.name}>
          <ComponentScreenshot component={c} />
        </Suspense>
      ))}
    </div>
  )
}
