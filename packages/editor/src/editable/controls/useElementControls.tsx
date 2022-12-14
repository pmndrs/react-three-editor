import { useState } from "react"
import { useControls, button, levaStore } from "leva"
import { EditableElement } from "../EditableElement"
import { element } from "./tree/element"

export function useElementControls(
  folderName: string,
  entity: EditableElement,
  { store, ...options }: { store: typeof levaStore; order: number }
) {
  const [run, setRun] = useState(0)
  let entityStore = entity.store!

  useControls(
    () => {
      return {
        ...entity.controls,
        save: button(
          async () => {
            entity.save()
          },
          {
            disabled: true
          }
        )
      }
    },
    {
      store: entityStore
    },
    [entity, run]
  )

  useControls(
    {
      [entity.id]: element({
        element: entity,
        panel: true,
        collapsed: false,
        children: false,
        order: -1
      })
    },
    options,
    [entity]
  )

  return entityStore
}
