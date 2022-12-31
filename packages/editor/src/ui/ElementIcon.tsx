import { EditableElement } from "@editable-jsx/core/EditableElement"
import { Icon } from "@iconify/react"
import { ComponentProps } from "react"

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
