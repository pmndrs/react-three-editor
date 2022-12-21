import { createEditableWithoutRef } from "./createEditableWithoutRef"
import { createEditableWithRef } from "./createEditableWithRef"
import { hasRef } from "./utils"

export const createEditable = (Component: any) => {
  return hasRef(Component)
    ? createEditableWithRef(Component)
    : createEditableWithoutRef(Component)
}
