import { levaStore, useControls } from "leva"
import { element } from "../ui/leva/element"
import { EditableElement } from "./EditableElement"

export function useElementControls(
  entity: EditableElement,
  { store, order, ...options }: { store: typeof levaStore; order?: number }
) {
  let entityStore = entity.store!
  useControls(
    () => {
      return {
        ...entity.controls
      }
    },
    {
      store: entityStore
    },
    [entity]
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
