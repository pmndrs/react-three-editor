import { ComponentProps } from "react"
import { Icon } from "../../../ui-utils/dist/editable-jsx-ui.cjs"
import { EditableElement } from "../EditableElement"

export function ElementIcon({
  element,
  ...props
}: { element: EditableElement } & Omit<ComponentProps<typeof Icon>, "icon">) {
  return (
    <Icon
      icon={element.icon}
      onClick={(e) => element.editor.select(element)}
      {...props}
    />
  )
}
