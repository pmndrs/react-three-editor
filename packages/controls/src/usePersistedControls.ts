import { folder, useControls } from "leva"
import {
  Schema,
  SchemaToValues,
  StoreType
} from "leva/dist/declarations/src/types"
import { useEffect, useState } from "react"

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
            if (props[key].__customInput) {
              props[key].__customInput.data = read
            } else {
              props[key].value = read
            }
          }

          if (props[key].onChange) {
            let onChange = props[key].onChange
            props[key].onChange = (e: any, path: string, context: any) => {
              onChange(e, path, context)
              localStorage.setItem(
                `${editorName}.` + folderName + "." + key,
                JSON.stringify(e)
              )
            }
          }
        } catch (e) {
          console.log(e)
          localStorage.removeItem(`${editorName}.${folderName}.${key}`)
        }
      }
    } else {
      try {
        let read = JSON.parse(
          localStorage.getItem(`${editorName}.${folderName}.${key}`) ?? "null"
        )

        if (read != null) {
          if (props[key]?.__customInput) {
            props[key].__customInput.data = read
          } else {
            props[key] = read
          }
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
export type RReturnType<F extends SchemaOrFn> = F extends SchemaOrFn<infer S>
  ? F extends Function
    ? FunctionReturnType<S>
    : SchemaToValues<S>
  : never

export function usePersistedControls<S extends Schema, T extends SchemaOrFn<S>>(
  folderName: string,
  props: T,
  deps: any[] = [],
  store = undefined as StoreType | undefined,
  hidden = false,
  order = 0,
  _collapsed = true
): SchemaToValues<S> {
  const [collapsed, setCollpased] = useState(_collapsed)
  const [values, set] = useControls(
    () => {
      manageProps(folderName, props)

      return {
        [folderName]: folder(
          {
            ...props
          },
          {
            collapsed: collapsed,
            render: () => !hidden,
            order: order
          }
        )
      }
    },
    {
      store: store
    },
    [...deps, collapsed]
  )

  useEffect(() => {
    Object.keys(values).forEach((key) => {
      localStorage.setItem(
        `${editorName}.` + folderName + "." + key,
        JSON.stringify(values[key])
      )
    })
  }, [folderName, values])

  return values as any
}
