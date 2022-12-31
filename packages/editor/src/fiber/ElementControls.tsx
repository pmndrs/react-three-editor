import { Editable } from "@editable-jsx/core/src/EditableElement"
import { levaStore, useControls } from "leva"
import { element as elementProperties } from "../ui/leva/element"

export function useElementControls(
  entity: Editable,
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
      [entity.id]: elementProperties({
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
  element: Editable
  store: typeof levaStore
  order?: number
}) {
  useElementControls(element, { store, order: order })
  return null
}
