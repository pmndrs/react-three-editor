import { EditableElement } from "@editable-jsx/editable/EditableElement"
import { BoxHelper } from "three"

export const group = {
  applicable: (object: any) => object.ref?.isGroup,
  icon: () => "tabler:3d-cube-sphere",
  helper: ({ element }: { element: EditableElement }) => {
    element.useHelper("group", BoxHelper)
    return null
  }
}
