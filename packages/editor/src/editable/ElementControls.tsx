import { button, levaStore, useControls } from "leva"
import { useState } from "react"
import { element } from "../ui/leva/element"
import { EditableElement } from "./EditableElement"

export function useElementControls(
  entity: EditableElement,
  { store, order, ...options }: { store: typeof levaStore; order?: number }
) {
  const [run, setRun] = useState(0)
  let entityStore = entity.store!
  entity.resetControls = () => {
    setRun((r) => r + 1)
  }

  useControls(
    () => {
      return {
        ...entity.controls,
        save: button(() => {
          entity.save()
        })
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
        order: order
      })
    },
    { ...options, store },
    [entity]
  )

  return entityStore
}

export function ElementControls({
  element,
  store,
  order
}: {
  element: EditableElement
  store: typeof levaStore
  order?: number
}) {
  useElementControls(element, { store, order: order })
  return null
}
