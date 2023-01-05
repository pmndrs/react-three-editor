import { EditableElement, PropInput } from "@editable-jsx/editable"
import { Schema } from "@editable-jsx/state"
import { folder } from "leva"
import { BufferGeometry } from "three"
import { all } from "."

function args({
  element,
  fields
}: PropInput & {
  fields: Record<string, any>
}): Schema {
  let fieldNames = Object.keys(fields)

  return {
    args: {
      value: 0,
      render: () => false,
      onChange(v, x, context) {
        if (context.initial && !element.args?.length) {
          element.args = Array.from(fieldNames).map((i) => fields[i].default)
        }
      }
    },
    ...fields
  } satisfies Schema
}

export const boxGeometryControls = (
  element: EditableElement,
  path: string[]
) => {
  return {
    type: all.select({
      element,
      path: [...path, "type"],
      options: ["BoxGeometry", "SphereGeometry", "CylinderGeometry"],
      onChange(e: string) {
        element.type = e.charAt(0).toLowerCase() + e.slice(1)
        element.properties.setValueAtPath("name", element.displayName, false)
        element.render()
        return true
      }
    }),
    ...args({
      path,
      element,
      fields: {
        width: all.number({
          element,
          default: 1,
          step: 0.1,
          min: 0,
          max: 100,
          path: ["args", "0"]
        }),
        height: all.number({
          element,
          default: 1,
          step: 0.1,
          min: 0,
          max: 100,
          path: ["args", "1"]
        }),
        depth: all.number({
          element,
          default: 1,
          step: 0.1,
          min: 0,
          max: 100,
          path: ["args", "2"]
        }),
        widthSegments: all.number({
          element,
          default: 1,
          step: 1,
          min: 1,
          max: 100,
          path: ["args", "3"]
        }),
        heightSegments: all.number({
          element,
          default: 1,
          step: 1,
          min: 1,
          max: 100,
          path: ["args", "4"]
        }),
        depthSegments: all.number({
          element,
          default: 1,
          step: 1,
          min: 1,
          max: 100,
          path: ["args", "5"]
        })
      }
    })
  }
}

export const sphereGeometryControls = (
  element: EditableElement,
  path: string[]
) => {
  return {
    type: all.select({
      element,
      path: [...path, "type"],
      options: ["BoxGeometry", "SphereGeometry", "CylinderGeometry"],
      onChange(e: string) {
        element.type = e.charAt(0).toLowerCase() + e.slice(1)
        element.render()
        // element.resetControls()
      }
    }),
    ...args({
      path,
      element,
      fields: {
        radius: all.number({
          element,
          default: 1,
          step: 0.1,
          min: 0,
          max: 100,
          path: ["args", "0"]
        }),
        widthSegments: all.number({
          element,
          default: 1,
          step: 0.1,
          min: 0,
          max: 100,
          path: ["args", "1"]
        }),
        heightSegments: all.number({
          element,
          default: 1,
          step: 0.1,
          min: 0,
          max: 100,
          path: ["args", "2"]
        })
      }
    })
  }
}

export const geometryControls = ({ element, path }: PropInput) => {
  const type = element.getObjectByPath<BufferGeometry>(path)?.type
  switch (type) {
    case "BoxGeometry":
      return boxGeometryControls(element, path)
    case "SphereGeometry":
      return sphereGeometryControls(element, path)
    default:
      return {}
  }
}

export const geometry = ({ element, path }: PropInput) => {
  return folder(geometryControls({ element, path }))
}
