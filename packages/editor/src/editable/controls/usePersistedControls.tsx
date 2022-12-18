import { folder, useControls } from "leva"
import {
  Schema,
  SchemaToValues,
  StoreType
} from "leva/dist/declarations/src/types"
import { useEffect } from "react"

let editorName = "r3f-editor"

function manageProps(folderName: string, props: any) {
  Object.keys(props).forEach((key) => {
    if (typeof props[key] === "object") {
      if (props[key].type === "FOLDER") {
        manageProps(`${folderName}.${key}`, props[key].schema)
      } else {
        try {
          let read = JSON.parse(
            localStorage.getItem(`${editorName}.${folderName}.${key}`) ?? "null"
          )

          if (read != null) {
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

        if (read != null) {
          props[key] = read
        }
      } catch (e) {
        console.log(e)
      }
    }
  })
}

export type SchemaOrFn<S extends Schema = Schema> = S | (() => S)
export type FunctionReturnType<S extends Schema> = [
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
  deps = [],
  store = undefined as StoreType | undefined,
  hidden = false
): ReturnType<() => S> {
  const [values, set] = useControls(
    () => {
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

      return {
        [folderName]: folder(
          {
            ...props
          },
          {
            collapsed: true,
            render: () => !hidden
          }
        )
      }
    },
    {
      store: store
    },
    [...deps]
  )

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
