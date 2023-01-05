import { EditableElement } from "@editable-jsx/editable/EditableElement"
import { folder } from "leva"
import { Schema } from "leva/plugin"
import { MeshPhysicalMaterial } from "three"
import { primitives } from "../primitives"
import { texture } from "../texture"
import { commonControls } from "./common"

export const meshPhysicalMaterial = (
  element: EditableElement,
  path: string[] = ["ref"]
): Schema => {
  return {
    color: primitives.color({
      element,
      path: [...path, "color"]
    }),
    attenuationColor: primitives.color({
      element,
      path: [...path, "attenuationColor"]
    }),
    attenuationDistance: primitives.number({
      element,
      path: [...path, "attenuationDistance"]
    }),
    flatShading: primitives.bool({
      element,
      path: [...path, "flatShading"],
      onChange: () => {
        element.getObjectByPath<MeshPhysicalMaterial>(path).needsUpdate = true
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
    clearCoat: folder(
      {
        clearCoatValue: primitives.number({
          element,
          label: "value",
          path: [...path, "clearCoat"]
        }),
        ...texture({ element, path: [...path, "clearCoatMap"] }).schema
      },
      {
        collapsed: true
      }
    ),
    clearCoatNormal: texture({
      element: element,
      path: [...path, "clearCoatNormalMap"]
    }),
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
    // ...createTextureFolder(element, "map", path),
    // ...createTextureFolder(element, "alpha", path),
    // ...createTextureFolder(element, "ao", path),
    // ...createTextureFolder(element, "bump", path),
    // ...createTextureFolder(element, "displacement", path),
    // ...createTextureFolder(element, "emissive", path, {
    //   emissiveColor: prop.color({
    //     element,
    //     path: [...path, "emissive"],
    //     label: "color"
    //   })
    // }),
    // ...createTextureFolder(element, "env", path),
    // ...createTextureFolder(element, "light", path),
    // ...createTextureFolder(element, "metalness", path, {
    //   metalnessValue: prop.number({
    //     element,
    //     path: [...path, "metalness"],
    //     label: "value",
    //     min: 0,
    //     max: 1,
    //     step: 0.1
    //   })
    // }),
    // ...createTextureFolder(element, "roughness", path, {
    //   roughnessValue: prop.number({
    //     element,
    //     path: [...path, "roughness"],
    //     label: "value",
    //     min: 0,
    //     max: 1,
    //     step: 0.1
    //   })
    // }),
    // ...createTextureFolder(element, "normal", path)
  }
}
