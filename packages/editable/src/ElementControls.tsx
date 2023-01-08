import { ControlledStore } from "@editable-jsx/state"
import { useControls } from "leva"
import { StoreType } from "leva/dist/declarations/src/types"
import { EditableElement } from "./EditableElement"
import { element } from "./ui/element"

export function useElementControls(
  entity: EditableElement,
  { store, order, ...options }: { store: ControlledStore; order?: number }
) {
  let entityStore = entity.properties!
  useControls(
    () => {
      return {
        ...entity.controls
      }
    },
    {
      store: entityStore as StoreType
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
    { ...options, store: store as StoreType },
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
  store: ControlledStore
  order?: number
}) {
  useElementControls(element, { store, order: order })
  return null
}
