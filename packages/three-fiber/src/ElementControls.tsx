import {
  EditableElement,
  element as elementProperties
} from "@editable-jsx/editable"
import { levaStore, useControls } from "leva"

export function useElementControls(
  entity: EditableElement,
  { store, order, ...options }: { store: typeof levaStore; order?: number }
) {
  let entityStore = entity.properties!
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
  element: EditableElement
  store: typeof levaStore
  order?: number
}) {
  useElementControls(element, { store, order: order })
  return null
}
