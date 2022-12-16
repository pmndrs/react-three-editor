import { button, levaStore, useControls } from "leva"
import { useState } from "react"
import { EditableElement } from "../EditableElement"
import { element } from "./tree/element"

export function useElementControls(
  entity: EditableElement,
  { store, ...options }: { store: typeof levaStore; order: number }
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

export function ElementControls({
  element,
  store
}: {
  element: EditableElement
  store: typeof levaStore
}) {
  useElementControls(element, { store, order: -1 })
  return null
}
