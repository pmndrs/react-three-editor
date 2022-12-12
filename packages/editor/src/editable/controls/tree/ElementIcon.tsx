import { ComponentProps } from "react"
import { EditableElement } from "../../EditableElement"
import { Icon } from "@iconify/react"
import React from "react"
import { OrbitControls } from "three-stdlib"

export function ElementIcon({
  element,
  ...props
}: { element: EditableElement } & Omit<ComponentProps<typeof Icon>, "icon">) {
  return (
    <Icon
      icon={
        element.ref?.isCamera
          ? "ph:video-camera-bold"
          : element.ref?.isLight
          ? "ph:lightbulb-filament-bold"
          : element.ref instanceof OrbitControls
          ? "mdi:orbit-variant"
          : "ph:cube"
      }
      onClick={(e) =>
        element.editor.setState({
          selected: element
        })
      }
      {...props}
    />
  )
}
