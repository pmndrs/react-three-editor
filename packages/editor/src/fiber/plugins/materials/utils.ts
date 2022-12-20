import { folder } from "leva"
import {
  ClampToEdgeWrapping,
  MirroredRepeatWrapping,
  RepeatWrapping,
  Texture
} from "three"
import { EditableElement } from "../../../editable/EditableElement"
import { prop } from "../../controls/prop"

export const createTextureFolder = (
  element: EditableElement,
  prefix: string,
  path: string[],
  otherControls: any = {}
) => {
  const texturePropName = `${prefix !== "map" ? prefix + "Map" : "map"}`
  const folderPrefix = prefix

  return {
    [`${folderPrefix}`]: folder(
      {
        ...otherControls,
        [`${folderPrefix}Map`]: prop.texture({
          element,
          label: "texture",
          onChange(value, prop, p) {
            let o = element.getObjectByPath<Texture>([...path, texturePropName])
            element.store?.setValueAtPath(p + "WrapS", o.wrapS, false)
            element.store?.setValueAtPath(p + "WrapT", o.wrapT, false)
            element.store?.setValueAtPath(
              p + "Repeat",
              o.repeat.toArray(),
              false
            )
          },
          path: [...path, texturePropName]
        }),
        [`${folderPrefix}MapWrapS`]: prop.select({
          element,
          path: [...path, texturePropName, "wrapS"],
          options: {
            RepeatWrapping,
            ClampToEdgeWrapping,
            MirroredRepeatWrapping
          },
          default: RepeatWrapping,
          label: "wrapS",
          onChange(v) {
            let o = element.getObjectByPath<Texture>([...path, texturePropName])
            o.needsUpdate = true
          },
          render: (get) => {
            let o = element.getObjectByPath<Texture>([...path, texturePropName])
            return !!(o && o.source)
          }
        }),
        [`${folderPrefix}MapWrapT`]: prop.select({
          element,
          path: [...path, texturePropName, "wrapT"],
          options: {
            RepeatWrapping,
            ClampToEdgeWrapping,
            MirroredRepeatWrapping
          },
          default: RepeatWrapping,
          label: "wrapT",
          render: (get) => {
            let o = element.getObjectByPath<Texture>([...path, texturePropName])
            return !!(o && o.source)
          },
          onChange(v) {
            let o = element.getObjectByPath<Texture>([...path, texturePropName])
            o.needsUpdate = true
          }
        }),
        [`${folderPrefix}MapRepeat`]: prop.vector2d({
          element,
          path: [...path, texturePropName, "repeat"],
          label: "repeat",
          default: [1, 1],
          step: 0.1,
          render: (get) => {
            let o = element.getObjectByPath<Texture>([...path, texturePropName])
            return !!(o && o.source)
          }
        })
      },
      {
        collapsed: true
      }
    )
  }
}
