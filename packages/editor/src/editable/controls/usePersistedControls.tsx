import { folder, useControls } from "leva"
import { Schema, SchemaToValues } from "leva/dist/declarations/src/types"
import { useEffect } from "react"

let editorName = "r3f-editor"

function manageProps(folderName, props: any) {
  Object.keys(props).forEach((key) => {
    if (typeof props[key] === "object") {
      if (props[key].type === "FOLDER") {
        manageProps(`${folderName}.${key}`, props[key].schema)
      } else {
        try {
          let read = JSON.parse(
            localStorage.getItem(`${editorName}.${folderName}.${key}`) ?? "null"
          )
          console.log(`${editorName}.${folderName}.${key}`, read)

          if (read !== null) {
            props[key].value = read
          }
        } catch (e) {
          console.log(e)
        }
      }
    } else {
      try {
        let read = JSON.parse(
          localStorage.getItem(`${editorName}.${folderName}.${key}`) ?? "null"
        )

        props[key] = read
      } catch (e) {
        console.log(e)
      }
    }
  })
}

// <S extends Schema, F extends SchemaOrFn<S> | string, G extends SchemaOrFn<S>>(schemaOrFolderName: F, settingsOrDepsOrSchema?: HookSettings | React.DependencyList | G, depsOrSettingsOrFolderSettings?: React.DependencyList | HookSettings | FolderSettings, depsOrSettings?: React.DependencyList | HookSettings, depsOrUndefined?: React.DependencyList): HookReturnType<F, G>

type SchemaOrFn<S extends Schema = Schema> = S | (() => S)
type FunctionReturnType<S extends Schema> = [
  SchemaToValues<S>,
  (value: {
    [K in keyof Partial<SchemaToValues<S, true>>]: SchemaToValues<S, true>[K]
  }) => void,
  <T extends keyof SchemaToValues<S, true>>(
    path: T
  ) => SchemaToValues<S, true>[T]
]
type ReturnType<F extends SchemaOrFn> = F extends SchemaOrFn<infer S>
  ? F extends Function
    ? FunctionReturnType<S>
    : SchemaToValues<S>
  : never

export function usePersistedControls<S extends Schema, T extends SchemaOrFn<S>>(
  folderName: string,
  props: T,
  deps = []
): ReturnType<() => S> {
  const [values, set] = useControls(() => {
    // Object.keys(props).forEach((key) => {
    //   let read = JSON.parse(
    //     localStorage.getItem(`${editorName}.${folderName}.${key}`) ?? "null"
    //   )
    //   if (read !== null) {
    //     if (typeof props[key] === "object") {
    //       props[key].value = read
    //     } else {
    //       props[key] = read
    //     }
    //   }
    // })
    manageProps(folderName, props)

    console.log(folderName, props)

    return {
      [folderName]: folder(
        {
          ...props
        },
        {
          collapsed: true
        }
      )
    }
  }, deps)

  useEffect(() => {
    Object.keys(values).forEach((key) => {
      localStorage.setItem(
        `${editorName}.` + folderName + "." + key,
        JSON.stringify(values[key])
      )
    })
  }, [folderName, values])

  return [values, set] as any
}
