import { folder } from "leva"
import {
  BackSide,
  ClampToEdgeWrapping,
  DoubleSide,
  FrontSide,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MirroredRepeatWrapping,
  RepeatWrapping,
  Texture
} from "three"
import { EditableElement } from "../../editable/EditableElement"
import { prop } from "../controls/prop"

const commonControls = (element: EditableElement, path: string[]) => {
  return {
    // common: folder({
    transparent: prop.bool({
      element,
      path: [...path, "transparent"],
      onChange: (value) => {
        element.ref.needsUpdate = true
      }
    }),
    opacity: prop.bool({
      element,
      path: [...path, "opacity"],
      min: 0,
      max: 1,
      step: 0.1
    }),
    toneMapped: prop.bool({
      element,
      path: [...path, "tonemapped"]
    }),
    side: prop.select({
      element,
      path: [...path, "side"],
      options: {
        FrontSide,
        BackSide,
        DoubleSide
      }
    }),
    shadowSide: prop.select({
      element,
      path: [...path, "shadowSide"],
      default: "null",
      options: {
        FrontSide,
        BackSide,
        DoubleSide
      }
    }),
    precision: prop.select({
      element,
      path: [...path, "precision"],
      options: [null, "highp", "mediump", "lowp"],
      default: null
    })
    // })
  }
}

const meshBasicMaterialControls = (
  element: EditableElement,
  path: string[]
) => {
  return {
    color: prop.color({
      element,
      path: [...path, "color"]
    }),
    ...commonControls(element, path),
    fog: prop.bool({
      element,
      path: [...path, "fog"]
    }),
    reflectivity: prop.number({
      element,
      path: [...path, "reflectivity"]
    }),
    refractionRatio: prop.number({
      element,
      path: [...path, "refractionRatio"]
    })
  }
}

const createTextureFolder = (
  element: EditableElement,
  prefix: string,
  path: string[] = ["ref"],
  otherControls: any = {}
) => {
  const texturePropName = `${prefix !== "map" ? prefix + "Map" : "map"}`

  return {
    [`${prefix}`]: folder(
      {
        ...otherControls,
        [`${prefix}Map`]: prop.texture({
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
        [`${prefix}MapWrapS`]: prop.select({
          element,
          path: [...path, texturePropName, "wrapS"],
          options: {
            RepeatWrapping,
            ClampToEdgeWrapping,
            MirroredRepeatWrapping
          },
          default: RepeatWrapping,
          label: "wrapS",
          render: (get) => {
            return (
              get(`${prefix}.${prefix}Map`) !== null &&
              get(`${prefix}.${prefix}Map`) !== undefined
            )
          }
        }),
        [`${prefix}MapWrapT`]: prop.select({
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
            return (
              get(`${prefix}.${prefix}Map`) !== null &&
              get(`${prefix}.${prefix}Map`) !== undefined
            )
          }
        }),
        [`${prefix}MapRepeat`]: prop.vector2d({
          element,
          path: [...path, texturePropName, "repeat"],
          label: "repeat",
          default: [1, 1],
          render: (get) => {
            return (
              get(`${prefix}.${prefix}Map`) !== null &&
              get(`${prefix}.${prefix}Map`) !== undefined
            )
          }
        })
      },
      {
        collapsed: true
      }
    )
  }
}

const meshStandardMaterialControls = (
  element: EditableElement,
  path: string[]
) => {
  return {
    color: prop.color({
      element,
      path: [...path, "color"]
    }),
    flatShading: prop.bool({
      element,
      path: [...path, "flatShading"]
    }),
    ...commonControls(element, path),
    fog: prop.bool({
      element,
      path: [...path, "fog"]
    }),
    ...createTextureFolder(element, "map"),
    ...createTextureFolder(element, "alpha"),
    ...createTextureFolder(element, "ao"),
    ...createTextureFolder(element, "bump"),
    ...createTextureFolder(element, "displacement"),
    ...createTextureFolder(element, "emissive", path, {
      emissiveColor: prop.color({
        element,
        path: [...path, "emissive"],
        label: "color"
      })
    }),
    ...createTextureFolder(element, "env"),
    ...createTextureFolder(element, "light"),
    ...createTextureFolder(element, "metalness", path, {
      metalnessValue: prop.number({
        element,
        path: [...path, "metalness"],
        label: "value",
        min: 0,
        max: 1,
        step: 0.1
      })
    }),
    ...createTextureFolder(element, "roughness", path, {
      roughnessValue: prop.number({
        element,
        path: [...path, "roughness"],
        label: "value",
        min: 0,
        max: 1,
        step: 0.1
      })
    }),
    ...createTextureFolder(element, "normal")
  }
}

export const material = {
  applicable: (entity: EditableElement) => entity.ref instanceof Material,
  icon: (entity: EditableElement) => "ph:paint-brush-broad-duotone",
  controls: (entity: EditableElement) => {
    return {
      ...(entity.ref instanceof MeshBasicMaterial
        ? meshBasicMaterialControls(entity, ["ref"])
        : {}),
      ...(entity.ref instanceof MeshStandardMaterial
        ? meshStandardMaterialControls(entity, ["ref"])
        : {})
    }
  }
}

export const meshMaterial = {
  applicable: (entity: EditableElement) =>
    entity.ref instanceof Mesh && entity.ref.material instanceof Material,
  controls: (entity: EditableElement) => {
    return {
      material: folder({
        ...(entity.ref.material instanceof MeshBasicMaterial
          ? meshBasicMaterialControls(entity, ["ref", "material"])
          : {}),
        ...(entity.ref.material instanceof MeshStandardMaterial
          ? meshStandardMaterialControls(entity, ["ref", "material"])
          : {})
      })
    }
  }
}
