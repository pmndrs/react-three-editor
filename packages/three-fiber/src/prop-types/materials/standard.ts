import { EditableElement } from "@editable-jsx/editable/EditableElement"
import { folder } from "leva"
import { Schema } from "leva/plugin"
import { MeshStandardMaterial } from "three"
import { primitives } from "../primitives"
import { texture } from "../texture"
import { commonControls } from "./common"

export const meshStandardMaterial = (
  element: EditableElement,
  path: string[] = ["ref"]
): Schema => {
  return {
    color: primitives.color({
      element,
      path: [...path, "color"]
    }),
    flatShading: primitives.bool({
      element,
      path: [...path, "flatShading"],
      onChange: () => {
        element.getObjectByPath<MeshStandardMaterial>(path).needsUpdate = true
      }
    }),
    fog: primitives.bool({
      element,
      path: [...path, "fog"]
    }),
    wireframe: primitives.bool({
      element,
      path: [...path, "wireframe"]
    }),
    ...commonControls(element, path),
    map: texture({
      element: element,
      path: [...path, "map"]
    }),
    alpha: texture({
      element: element,
      path: [...path, "alphaMap"]
    }),
    ao: texture({
      element: element,
      path: [...path, "aoMap"]
    }),
    bump: texture({
      element: element,
      path: [...path, "bumpMap"]
    }),
    displacement: texture({
      element: element,
      path: [...path, "displacementMap"]
    }),
    emissive: folder(
      {
        emissiveColor: primitives.color({
          element,
          path: [...path, "emissive"],
          label: "color"
        }),
        ...texture({
          element: element,
          path: [...path, "emissiveMap"]
        }).schema
      },
      { collapsed: true }
    ),
    env: texture({
      element: element,
      path: [...path, "envMap"]
    }),
    light: texture({
      element: element,
      path: [...path, "lightMap"]
    }),
    metalness: folder(
      {
        metalnessValue: primitives.number({
          element,
          path: [...path, "metalness"],
          label: "value",
          min: 0,
          max: 1,
          step: 0.1
        }),
        ...texture({
          element: element,
          path: [...path, "metalnessMap"]
        }).schema
      },
      { collapsed: true }
    ),
    roughness: folder(
      {
        roughnessValue: primitives.number({
          element,
          path: [...path, "roughness"],
          label: "value",
          min: 0,
          max: 1,
          step: 0.1
        }),
        ...texture({
          element: element,
          path: [...path, "roughnessMap"]
        }).schema
      },
      { collapsed: true }
    ),
    normal: texture({
      element: element,
      path: [...path, "normalMap"]
    })
  }
}
