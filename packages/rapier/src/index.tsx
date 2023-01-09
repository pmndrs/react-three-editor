import { setEditable, useEditor } from "@editable-jsx/editable"
import { Debug, Physics, useRapier } from "@react-three/rapier"
import { useMemo } from "react"

setEditable(Physics, ({ children, ...props }) => {
  const editor = useEditor()
  const { paused } = editor.useSettings("physics", {
    paused: {
      value: false
    }
  })

  console.log(paused)

  return (
    <Physics {...props} paused={paused}>
      <RapierPlugin />
      {children}
    </Physics>
  )
})

export function RapierPlugin() {
  const { rapier, world } = useRapier()
  const editor = useEditor()

  const props = editor.useSettings("physics", {
    debug: {
      value: true
    }
  })

  useMemo(() => {
    let plugin = {
      applicable: (e) => e instanceof rapier.Ray,
      debug: (info: typeof rapier.Ray, v: any, editor) => {
        let ray = {
          origin: info.origin,
          direction: info.dir,
          distance: 10
        }
        editor.drafter.drawRay(ray, v)
        return () => {
          editor.drafter.dispose(ray)
        }
      }
    }

    editor.registerPlugin(plugin)
    return () => {
      editor.plugins = editor.plugins.filter((p) => p !== plugin)
    }
  }, [editor, rapier])

  console.log(props)

  return <>{props.debug ? <Debug /> : null}</>
}
