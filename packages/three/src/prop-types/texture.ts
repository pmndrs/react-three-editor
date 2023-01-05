import { createProp, PropInput } from "@editable-jsx/editable"
import { folder, Schema } from "@editable-jsx/state"
import {
  ClampToEdgeWrapping,
  MirroredRepeatWrapping,
  RepeatWrapping,
  Texture
} from "three"
import { imageTexture } from "./imageTexture"
import { primitives } from "./primitives"

export const texture = ({ element, path, collapsed = true }: PropInput) => {
  return folder(textureControls({ element, path }), {
    collapsed
  })
}

export const textureControls = ({ element, path }: PropInput) => {
  const folderName = path[path.length - 1]

  return {
    [`${folderName}Texture`]: createProp(imageTexture, {
      element,
      label: "texture",
      onChange(value, p) {
        let o = element.getObjectByPath<Texture>(path)
        element.properties.setValueAtPath(
          p.replace("Texture", "WrapS"),
          o.wrapS,
          false
        )
        element.properties.setValueAtPath(
          p.replace("Texture", "WrapT"),
          o.wrapT,
          false
        )
        element.properties.setValueAtPath(
          p.replace("Texture", "Repeat"),
          o.repeat.toArray(),
          false
        )
      },
      path
    }),
    [`${folderName}WrapS`]: primitives.select({
      element,
      path: [...path, "wrapS"],
      options: {
        RepeatWrapping,
        ClampToEdgeWrapping,
        MirroredRepeatWrapping
      },
      default: RepeatWrapping,
      label: "wrapS",
      onChange(v) {
        let o = element.getObjectByPath<Texture>(path)
        o.needsUpdate = true
      },
      render: (get) => {
        let o = element.getObjectByPath<Texture>(path)
        return !!(o && o.source)
      }
    }),
    [`${folderName}WrapT`]: primitives.select({
      element,
      path: [...path, "wrapT"],
      options: {
        RepeatWrapping,
        ClampToEdgeWrapping,
        MirroredRepeatWrapping
      },
      default: RepeatWrapping,
      label: "wrapT",
      render: (get) => {
        let o = element.getObjectByPath<Texture>(path)
        return !!(o && o.source)
      },
      onChange(v) {
        let o = element.getObjectByPath<Texture>(path)
        o.needsUpdate = true
      }
    }),
    [`${folderName}Repeat`]: primitives.vector2d({
      element,
      path: [...path, "repeat"],
      label: "repeat",
      default: [1, 1],
      step: 0.1,
      render: (get) => {
        let o = element.getObjectByPath<Texture>(path)
        return !!(o && o.source)
      }
    })
  } satisfies Schema
}
