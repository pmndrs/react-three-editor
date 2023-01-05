import { PropInput } from "@editable-jsx/editable"
import { folder } from "leva"
import { OrthographicCamera } from "three"
import { primitives } from "./primitives"
import { replace } from "./replace"

export function cameraControls({ element, path }: PropInput) {
  return {
    near: primitives.number({
      element: element,
      path: [...path, "near"],
      min: 0.1,
      max: 100
    }),
    far: primitives.number({
      element: element,
      path: [...path, "far"],
      min: 0.1,
      max: 10000
    }),
    ...(element.ref instanceof OrthographicCamera
      ? {
          zoom: primitives.number({
            element: element,
            path: [...path, "zoom"]
          }),
          top: primitives.number({
            element: element,
            path: [...replace(path, "ref", "currentProps"), "top"]
          }),
          bottom: primitives.number({
            element: element,
            path: [...replace(path, "ref", "currentProps"), "bottom"]
          }),
          left: primitives.number({
            element: element,
            path: [...replace(path, "ref", "currentProps"), "left"]
          }),
          right: primitives.number({
            element: element,
            path: [...replace(path, "ref", "currentProps"), "right"]
          })
        }
      : {}),

    fov: primitives.number({
      element: element,
      min: 0,
      max: 100,
      path: [...path, "fov"],
      onChange(value) {
        element.ref.updateProjectionMatrix()
      }
    })
  }
}

export const camera = ({ element, path }: PropInput) => {
  return folder(cameraControls({ element, path }))
}
