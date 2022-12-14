import { useControls, folder } from "leva"
import { useEffect } from "react"
import { Schema } from "leva/dist/declarations/src/types"

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

export function usePersistedControls<A extends string, T extends Schema>(
  folderName: A,
  props: T,
  deps = []
) {
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

  return [values, set] as const
}
