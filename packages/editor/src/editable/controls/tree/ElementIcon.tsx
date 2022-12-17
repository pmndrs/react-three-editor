import { Icon } from "@iconify/react"
import { ComponentProps } from "react"
import { EditableElement } from "../../EditableElement"

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
