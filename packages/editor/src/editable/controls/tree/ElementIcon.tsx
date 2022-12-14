import { ComponentProps } from "react"
import { EditableElement } from "../../EditableElement"
import { Icon } from "@iconify/react"
import React from "react"

export function ElementIcon({
  element,
  ...props
}: { element: EditableElement } & Omit<ComponentProps<typeof Icon>, "icon">) {
  return (
    <Icon
      icon={element.icon}
      onClick={(e) =>
        element.editor.store.setState({
          selectedId: element.id
        })
      }
      {...props}
    />
  )
}
