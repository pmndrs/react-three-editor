import { folder } from "leva"
import {
  BackSide,
  DoubleSide,
  FrontSide,
  Material,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  ClampToEdgeWrapping,
  MirroredRepeatWrapping
} from "three"
import { EditableElement } from "../../editable/EditableElement"
import { prop } from "../controls/prop"

const commonControls = (element: EditableElement) => {
  return {
    common: folder({
      transparent: prop.bool({
        element,
        path: ["ref", "transparent"]
      }),
      opacity: prop.bool({
        element,
        path: ["ref", "opacity"],
        min: 0,
        max: 1,
        step: 0.1
      }),
      toneMapped: prop.bool({
        element,
        path: ["ref", "tonemapped"]
      }),
      side: prop.select({
        element,
        path: ["ref", "side"],
        options: {
          FrontSide,
          BackSide,
          DoubleSide
        }
      }),
      shadowSide: prop.select({
        element,
        path: ["ref", "shadowSide"],
        default: "null",
        options: {
          FrontSide,
          BackSide,
          DoubleSide
        }
      }),
      precision: prop.select({
        element,
        path: ["ref", "precision"],
        options: [null, "highp", "mediump", "lowp"],
        default: null
      })
    })
  }
}

const meshBasicMaterialControls = (element: EditableElement) => {
  return {
    color: prop.color({
      element,
      path: ["ref", "color"]
    }),
    fog: prop.bool({
      element,
      path: ["ref", "fog"]
    }),
    reflectivity: prop.number({
      element,
      path: ["ref", "reflectivity"]
    }),
    refractionRatio: prop.number({
      element,
      path: ["ref", "refractionRatio"]
    })
  }
}

const createTextureFolder = (element: EditableElement, prefix: string) => {
  const texturePropName = `${prefix !== "map" ? prefix : ""}Map`
  return {
    [`${prefix}`]: folder({
      [`${prefix}Map`]: prop.texture({
        element,
        path: ["ref", texturePropName]
      }),
      [`${prefix}MapWrapS`]: prop.select({
        element,
        path: ["ref", texturePropName, "wrapS"],
        options: {
          RepeatWrapping,
          ClampToEdgeWrapping,
          MirroredRepeatWrapping
        },
        default: ClampToEdgeWrapping,
        label: "Wrapping S",
        render: (get) => {
          return (
            get(`${prefix}.${prefix}Map`) !== null &&
            get(`${prefix}.${prefix}Map`) !== undefined
          )
        }
      }),
      [`${prefix}MapWrapT`]: prop.select({
        element,
        path: ["ref", texturePropName, "wrapT"],
        options: {
          RepeatWrapping,
          ClampToEdgeWrapping,
          MirroredRepeatWrapping
        },
        default: ClampToEdgeWrapping,
        label: "Wrapping T",
        render: (get) => {
          return (
            get(`${prefix}.${prefix}Map`) !== null &&
            get(`${prefix}.${prefix}Map`) !== undefined
          )
        }
      }),
      [`${prefix}MapRepeat`]: prop.vector2d({
        element,
        path: ["ref", texturePropName, "repeat"],
        label: "Repeat",
        default: [1, 1],
        render: (get) => {
          return (
            get(`${prefix}.${prefix}Map`) !== null &&
            get(`${prefix}.${prefix}Map`) !== undefined
          )
        }
      })
    })
  }
}

const meshStandardMaterialControls = (element: EditableElement) => {
  return {
    color: prop.color({
      element,
      path: ["ref", "color"]
    }),
    emissive: prop.color({
      element,
      path: ["ref", "emissive"]
    }),
    flatShading: prop.bool({
      element,
      path: ["ref", "flatShading"]
    }),
    fog: prop.bool({
      element,
      path: ["ref", "fog"]
    }),
    metalness: prop.number({
      element,
      path: ["ref", "metalness"],
      min: 0,
      max: 1,
      step: 0.1
    }),
    roughness: prop.number({
      element,
      path: ["ref", "roughness"],
      min: 0,
      max: 1,
      step: 0.1
    }),
    ...createTextureFolder(element, "map"),
    ...createTextureFolder(element, "alpha"),
    ...createTextureFolder(element, "ao"),
    ...createTextureFolder(element, "bump"),
    ...createTextureFolder(element, "displacement"),
    ...createTextureFolder(element, "emissive"),
    ...createTextureFolder(element, "env"),
    ...createTextureFolder(element, "light"),
    ...createTextureFolder(element, "metalness"),
    ...createTextureFolder(element, "roughness"),
    ...createTextureFolder(element, "normal")
  }
}

export const material = {
  applicable: (entity: EditableElement) => entity.ref instanceof Material,
  icon: (entity: EditableElement) => "ph:paint-brush-broad-duotone",
  controls: (entity: EditableElement) => {
    return {
      ...commonControls(entity),
      ...(entity.ref instanceof MeshBasicMaterial
        ? meshBasicMaterialControls(entity)
        : {}),
      ...(entity.ref instanceof MeshStandardMaterial
        ? meshStandardMaterialControls(entity)
        : {})
    }
  }
}
