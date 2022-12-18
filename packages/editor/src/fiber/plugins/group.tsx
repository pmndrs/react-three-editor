import { BoxHelper } from "three"
import { EditableElement } from "../../editable/EditableElement"

export const group = {
  applicable: (object: any) => object.ref?.isGroup,
  icon: () => "tabler:3d-cube-sphere",
  helper: ({ element }: { element: EditableElement }) => {
    element.useHelper("group", BoxHelper)
    return null
  }
}
