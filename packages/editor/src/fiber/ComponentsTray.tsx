import { Bounds } from "@react-three/drei"
import { useDrag } from "leva/plugin"
import { Suspense, useEffect } from "react"
import { suspend } from "suspend-react"
import { ComponentType } from "../component-loader"
import { useEditor } from "../editable"
import { editor } from "./editor"
import { Screenshot, useScreenshotStore } from "./useScreenshotStore"

const getComponent = async (path, name) => {
  // use import to get the React component from path
  console.log("getting", path, name)
  const component = await import(path)
  return component[name]
}
function LoadComponent({ component }) {
  const Component = suspend(async () => {
    return getComponent(component.importPath, component.name)
  }, [component.importPath, component.name])

  useEffect(() => {
    useScreenshotStore.setState((s) => {
      s.previews[component.importPath + component.name].readyForPreview = true
      return { ...s }
    })
    // return () => {
    // }
  }, [])
  return <Component />
}
function ComponentScreenshot({
  component,
  ...props
}: {
  component: ComponentType
}) {
  const editor = useEditor()
  const bind = useDrag((state) => {
    if (state.first) {
      editor.send("START_ADDING")
    } else if (state.last) {
      editor.send("STOP_ADDING")
      console.log(document.elementFromPoint(state.xy[0], state.xy[1]))
      ;(async () => {
        const Component = await getComponent(
          component.importPath,
          component.name
        )
        editor.appendNewElement(
          editor.selectedElement ?? editor.root,
          Component
        )
      })()
    }
  })
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
          onFit={() => {
            console.log("fit")
          }}
          key={component.importPath + component.name}
        >
          <LoadComponent component={component} />
        </Bounds>
      </Suspense>
    </Screenshot>
  )
}
export function ComponentsTray() {
  const components = editor.loader.store((s) => s.components)
  console.log(components)

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
        <ComponentScreenshot component={c} key={c.importPath + c.name} />
      ))}
      <button onClick={() => useScreenshotStore.getState().screenshot()}>
        screenshot
      </button>
    </div>
  )
}
