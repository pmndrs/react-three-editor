import { useState } from "react"
import { useControls, button, levaStore } from "leva"
import { EditableElement } from "../EditableElement"
import { client } from "../client"
import { element } from "./tree/element"

export function useElementControls(
  entity: EditableElement,
  store?: typeof levaStore
) {
  const [run, setRun] = useState(0)
  let entityStore = entity.store!

  useControls(
    "entity",
    {
      [entity.id]: element({
        element: entity,
        panel: true,
        collapsed: false,
        children: false
      })
    },
    {
      order: -1
    },
    {
      store
    },
    [entity]
  )

  useControls(
    () => {
      return {
        ...entity.controls,
        save: button(
          async () => {
            entity.save(client)
          },
          {
            disabled: !entity.dirty
          }
        )
      }
    },
    {
      store: entityStore
    },
    [entity, run]
  )

  return entityStore
}
